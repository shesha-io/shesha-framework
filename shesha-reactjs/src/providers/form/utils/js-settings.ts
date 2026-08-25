import { isPropertySettings } from '@/designer-components/_settings/utils/utils';
import { IPropertySetting } from '@/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { unproxyValue } from '@/utils/object';
import {
  EditMode,
  UnwrapCodeEvaluators,
} from '../models';
import { ObservableProxy } from '../observableProxy';
import { TouchableProxy } from '../touchableProxy';
import { executeScriptSync } from './scripts';
import { IDisabledAndReadOnly } from '@/components/formDesigner/formComponent/formComponentApi';
import { evaluateString } from '@/providers/form/utils';

export type UnwrapFunc = (model: unknown, propertyName: string, value: unknown, allData: object) => UnwrapCodeEvaluators<unknown> | unknown | undefined;

export const getSettingValue = <TValue = unknown>(
  propertyName: string,
  value: TValue,
  allData: object,
  calcFunction: (setting: IPropertySetting, allData: object) => TValue | undefined,
  parentDisabledAndReadOnly?: IDisabledAndReadOnly | undefined,
  propertyFilter?: ((name: string, value: unknown) => boolean) | undefined,
  processedObjects?: unknown[] | null,
  postProcessModel?: ((model: unknown) => void) | undefined,
  processFilteredProperties?: UnwrapFunc | undefined,
): UnwrapCodeEvaluators<TValue> | TValue | undefined => {
  const processed = isDefined(processedObjects) ? processedObjects : [];

  const unproxiedValue = unproxyValue(value);

  if (!isDefined(unproxiedValue))
    return value;
  else if (typeof unproxiedValue === 'object' && processed.indexOf(unproxiedValue) === -1) { // skip already processed objects to avoid infinite loop
    // If array - update all items
    if (Array.isArray(unproxiedValue)) {
      const v = unproxiedValue.length === 0
        ? unproxiedValue
        : unproxiedValue.map((x) => {
          return getActualModel(propertyName, x, allData, parentDisabledAndReadOnly, propertyFilter, processed, postProcessModel, processFilteredProperties);
        });
      processed.push(v);
      return v as UnwrapCodeEvaluators<TValue>;
    }
    // update setting value to actual but only if not lazy
    if (isPropertySettings<TValue>(unproxiedValue) && unproxiedValue._lazy !== true) {
      const v = unproxiedValue._mode === 'code'
        ? !isNullOrWhiteSpace(unproxiedValue._code) ? calcFunction(unproxiedValue, allData) : undefined
        : unproxiedValue._value;
      const upv = unproxyValue(v);
      processed.push(upv);
      return unproxiedValue._mode !== 'code' && typeof upv === 'string' && /\{\{.*?\}\}/.test(upv)
        ? evaluateString(upv, allData) as UnwrapCodeEvaluators<TValue>
        : upv;
    }
    // update nested objects
    const v = getActualModel(propertyName, unproxiedValue, allData, parentDisabledAndReadOnly, propertyFilter, processed, postProcessModel, processFilteredProperties);
    processed.push(v);
    return v as UnwrapCodeEvaluators<TValue>;
  }
  return typeof value === 'string' && /\{\{.*?\}\}/.test(value)
    ? evaluateString(value, allData) as UnwrapCodeEvaluators<TValue>
    : value;
};

const getValue = <TValue>(val: TValue, allData: object, calcValue: (setting: IPropertySetting, allData: object) => unknown): unknown => {
  return getSettingValue('', val, allData, calcValue);
};

interface IJsSettingsConstants<TValue> {
  staticValue: unknown;
  getSettingValue: (val: TValue) => unknown;
};

const calcValue = <TValue>(setting: IPropertySetting, allData: object): TValue | undefined => {
  const getSettingValueInScript = (val: TValue): unknown => getValue(val, allData, calcValue);
  try {
    if (allData instanceof TouchableProxy || allData instanceof ObservableProxy) {
      allData.addAccessor('staticValue', () => setting._value);
      allData.addAccessor('getSettingValue', () => getSettingValueInScript);
    } else {
      // TODO: Alex, please review. I've added type just to make linter happy
      const casted = allData as IJsSettingsConstants<TValue>;
      casted.staticValue = setting._value;
      casted.getSettingValue = getSettingValueInScript;
    }
    return !isNullOrWhiteSpace(setting._code)
      ? executeScriptSync(setting._code, allData)
      : undefined;
  } catch (error) {
    console.error("calcValue failed", error);
    return undefined;
  }
};

export const getReadOnlyBool = (editMode: EditMode | undefined, parentReadOnly: boolean): boolean => {
  return (
    editMode === false || // check exact condition
    editMode === 'readOnly' ||
    ((editMode === 'inherited' || editMode === undefined || editMode === true) && // check exact condition
      parentReadOnly)
  );
};

type HasEditMode = {
  editMode: EditMode | undefined;
  readOnly: boolean | undefined;
  disabled: boolean | undefined;
};
export const isHasEditMode = (value: object): value is HasEditMode => 'editMode' in value && (typeof value.editMode === 'string' || value.editMode === undefined || typeof (value.editMode) === 'boolean');

/**
 * Convert model to values calculated from JS code if provided (for each fields)
 *
 * @param model - model
 * @param allData - all form, contexts data and other data/objects/functions needed to calculate Actual Model
 * @returns - converted model
 */
export const getActualModel = <T = unknown>(
  propertyName: string,
  model: T,
  allData: object,
  parentDisabledAndReadOnly?: IDisabledAndReadOnly | undefined,
  propertyFilter?: ((name: string, value: unknown) => boolean) | undefined,
  processedObjects?: unknown[] | undefined,
  processModel?: ((model: unknown) => void) | undefined,
  processFilteredProperties?: UnwrapFunc | undefined,
): UnwrapCodeEvaluators<T> => {
  const processed = isDefined(processedObjects) ? processedObjects : [];

  if (Array.isArray(model)) {
    return getSettingValue(propertyName, model, allData, calcValue, parentDisabledAndReadOnly, propertyFilter, processed, processModel, processFilteredProperties) as UnwrapCodeEvaluators<T>;
  }

  if (!isDefined(model) || typeof model !== 'object')
    return model as UnwrapCodeEvaluators<T>;


  const m = {} as T;
  const filteredProperties: string[] = [];
  for (const propName in model) {
    if (!model.hasOwnProperty(propName)) continue;
    const value = model[propName];
    const fullPropertyName = isNullOrWhiteSpace(propertyName) ? propName : `${propertyName}.${propName}`;
    // skip filtered properties
    if (typeof propertyFilter === 'function' && !propertyFilter(fullPropertyName, value)) {
      filteredProperties.push(fullPropertyName);
      m[propName] = value;
      continue;
    }
    m[propName] = getSettingValue(fullPropertyName, value, allData, calcValue, parentDisabledAndReadOnly, propertyFilter, processed, processModel, processFilteredProperties) as typeof value;
  }

  processModel?.(m);

  // try to process filtered properties by processFilteredProperties or store as is
  filteredProperties.forEach((fullPropName) => {
    const propName = fullPropName.split('.').pop();
    if (propName === undefined) return;
    const value = m[propName as Extract<keyof T, string>];
    if (isDefined(processFilteredProperties) && typeof processFilteredProperties === 'function') {
      const unproxiedValue = unproxyValue(value);
      if (typeof unproxiedValue === 'object' && processed.indexOf(unproxiedValue) === -1) { // skip already processed objects to avoid infinite loop
        const v = processFilteredProperties(m, fullPropName, value, allData) ?? value;
        const upv = unproxyValue(v);
        processed.push(upv);
        m[propName as Extract<keyof T, string>] = upv as T[Extract<keyof T, string>];
      }
    }
  });

  return m as UnwrapCodeEvaluators<T>;
};

export const updateActualPropertyValue = <T>(model: T, allData: object, propertyName: keyof T): T => {
  return {
    ...model,
    [propertyName]: getSettingValue(propertyName as string, model[propertyName], allData, calcValue),
  } as T;
};
