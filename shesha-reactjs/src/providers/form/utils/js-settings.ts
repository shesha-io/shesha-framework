import {
  IPropertySetting,
} from '@/interfaces';
import {
  EditMode,
} from '../models';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import { ObservableProxy } from '../observableProxy';
import { unproxyValue } from '@/utils/object';
import { TouchableProxy } from '../touchableProxy';
import { executeScriptSync } from './scripts';
import { isDefined } from '@/utils/nullables';

const getSettingValue = <TValue = unknown>(
  propertyName: string,
  value: TValue,
  allData: object,
  calcFunction: (setting: IPropertySetting, allData: object) => TValue | undefined,
  parentReadOnly?: boolean | undefined,
  propertyFilter?: ((name: string, value: unknown) => boolean) | undefined,
  processedObjects?: unknown[] | null,
): TValue => {
  const processed = isDefined(processedObjects) ? processedObjects : [];

  const unproxiedValue = unproxyValue(value);

  if (!unproxiedValue || (typeof propertyFilter === 'function' && !propertyFilter(propertyName, value)))
    return value;

  if (typeof unproxiedValue === 'object' &&
    processed.indexOf(unproxiedValue) === -1 // skip already processed objects to avoid infinite loop
  ) {
    // If array - update all items
    if (Array.isArray(unproxiedValue)) {
      const v = unproxiedValue.length === 0
        ? unproxiedValue
        : unproxiedValue.map((x) => {
          // TODO: review and enable rule
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          return getActualModel(x, allData, parentReadOnly, propertyFilter, processed);
        });
      processed.push(v);
      return v as TValue;
    }

    // update setting value to actual
    if (isPropertySettings(unproxiedValue)) {
      const v = unproxiedValue._mode === 'code'
        ? Boolean(unproxiedValue._code) ? calcFunction(unproxiedValue, allData) : undefined
        : unproxiedValue._value;
      const upv = unproxyValue(v);
      processed.push(upv);
      return upv as TValue;
    }

    // update nested objects

    // TODO: review and enable rule
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const v = getActualModel(unproxiedValue, allData, parentReadOnly, propertyFilter, processed);
    processed.push(v);
    return v;
  }
  return value;
};

const getValue = <TValue>(val: TValue, allData: object, calcValue: (setting: IPropertySetting, allData: object) => unknown): unknown => {
  return getSettingValue('', val, allData, calcValue);
};

const calcValue = <TValue>(setting: IPropertySetting, allData: object): TValue | undefined => {
  const getSettingValueInScript = (val: TValue): unknown => getValue(val, allData, calcValue);
  try {
    if (allData instanceof TouchableProxy || allData instanceof ObservableProxy) {
      allData.addAccessor('staticValue', () => setting._value);
      allData.addAccessor('getSettingValue', () => getSettingValueInScript);
    } else {
      allData['staticValue'] = setting._value;
      allData['getSettingValue'] = getSettingValueInScript;
    }
    return setting._code
      ? executeScriptSync(setting._code, allData)
      : undefined;
  } catch (error) {
    console.error("calcValue failed", error);
    return undefined;
  }
};

const getReadOnlyBool = (editMode: EditMode | undefined, parentReadOnly: boolean): boolean => {
  return (
    editMode === false || // check exact condition
    editMode === 'readOnly' ||
    ((editMode === 'inherited' || editMode === undefined || editMode === true) && // check exact condition
      parentReadOnly)
  );
};

/**
 * Convert model to values calculated from JS code if provided (for each fields)
 *
 * @param model - model
 * @param allData - all form, contexts data and other data/objects/functions needed to calculate Actual Model
 * @returns - converted model
 */
export const getActualModel = <T extends object = object>(
  model: T,
  allData: object,
  parentReadOnly?: boolean | undefined,
  propertyFilter?: ((name: string, value: unknown) => boolean) | undefined,
  processedObjects?: unknown[] | undefined,
): T => {
  const processed = isDefined(processedObjects) ? processedObjects : [];

  if (Array.isArray(model)) {
    return getSettingValue('', model, allData, calcValue, parentReadOnly, propertyFilter, processed) as T;
  }

  if (typeof model !== 'object' || model === null || model === undefined)
    return model;

  const m = {} as T;
  for (const propName in model) {
    if (!model.hasOwnProperty(propName)) continue;
    const value = model[propName];
    m[propName] = getSettingValue<typeof value>(propName, value, allData, calcValue, parentReadOnly, propertyFilter, processed);
  }

  const readOnly = typeof parentReadOnly === 'undefined'
    ? "formMode" in allData ? allData.formMode === 'readonly' : undefined // TODO: review type of allData and update condition
    : parentReadOnly;

  // update ReadOnly if exists
  if (m.hasOwnProperty('editMode')) m['readOnly'] = getReadOnlyBool(m['editMode'], readOnly);

  return m;
};

// TODO: Alex, please review this. Purpose of the function is not clear from its name
export const getActualPropertyValue = <T>(model: T, allData: object, propertyName: string): T => {
  return { ...model, [propertyName]: getSettingValue(propertyName, model[propertyName], allData, calcValue) } as T;
};
