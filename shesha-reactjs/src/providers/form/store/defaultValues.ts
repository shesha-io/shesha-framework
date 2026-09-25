import { IToolboxComponents } from "@/interfaces/formDesigner";
import { IConfigurableFormComponent, IFlatComponentsStructure } from "../models";
import { asPropertiesArray, IModelMetadata } from "@/interfaces/metadata";
import { DataTypes } from "@/interfaces/dataTypes";
import { getValueByPropertyName, setValueByPropertyName } from "@/utils/object";

/**
 * Default value of a single input, resolved to the value that has to be written into the form model.
 */
export interface IFormDefaultValue {
  /** Full name (path) of the property the value is bound to, e.g. `qty` or `address.city` */
  propertyName: string;
  value: any;
}

/**
 * Resolves the actual value of the `defaultValue` setting of a component. The setting may be specified as an
 * expression (JS setting or a legacy mustache template) and has to be evaluated in the context of the form.
 */
export type DefaultValueEvaluator = (component: IConfigurableFormComponent) => any;

export interface IGetFormDefaultValuesPayload {
  flatStructure: IFlatComponentsStructure;
  toolboxComponents: IToolboxComponents;
  /** Evaluator of the `defaultValue` settings. When not specified the settings are used as is */
  evaluator?: DefaultValueEvaluator;
  /** Metadata of the form model, used to convert evaluated values to the data type of the property */
  metadata?: IModelMetadata;
}

/**
 * Matches a complete decimal numeric literal (`500`, `-1.5`, `.5`, `1e3`).
 *
 * Deliberately rejects partially numeric values ('12abc'), the `Infinity`/`NaN` literals and
 * hexadecimal notation, all of which `parseFloat`/`Number` would otherwise let through.
 */
const NUMERIC_LITERAL_REGEX = /^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/;

/** Returns true when the value should be treated as specified, i.e. it should not be replaced by a default value. */
const isValueSpecified = (value: any): boolean => value !== undefined && value !== null && value !== '';

/**
 * Returns the name prefix applied to the bindings of the passed component by its parents.
 *
 * Note: containers like the `propertyRouter` bind their children to a nested property of the model, the same prefix
 * is applied by the `FormItemProvider` at runtime and has to be taken into account here.
 */
const getNamePrefix = (component: IConfigurableFormComponent, allComponents: IFlatComponentsStructure['allComponents']): string => {
  const prefixes: string[] = [];

  let parent = component.parentId ? allComponents[component.parentId] : undefined;
  const visited = new Set<string>([component.id]);
  while (parent && !visited.has(parent.id)) {
    visited.add(parent.id);

    const routeName = parent['propertyRouteName'];
    if (typeof routeName === 'string' && routeName.length > 0)
      prefixes.unshift(routeName);

    parent = parent.parentId ? allComponents[parent.parentId] : undefined;
  }

  return prefixes.join('.');
};

/**
 * Returns the data type of the passed property according to the model metadata, `undefined` when it can't be resolved.
 *
 * Note: nested properties are not resolved, their metadata is loaded asynchronously and is not available here.
 */
const getPropertyDataType = (propertyName: string, metadata?: IModelMetadata): string | undefined => {
  if (!metadata || propertyName.includes('.'))
    return undefined;

  const properties = asPropertiesArray(metadata.properties, undefined);

  return properties?.find((p) => p.path?.toLowerCase() === propertyName.toLowerCase())?.dataType;
};

/**
 * Converts the passed value to the data type of the property it's bound to.
 *
 * Default values are authored as typed values in the designer, but legacy mustache templates
 * (e.g. `{{data.qty}}`) always evaluate to a string and would otherwise be submitted as a string for a
 * numeric or boolean property.
 */
const convertToDataType = (value: any, dataType?: string): any => {
  if (typeof value !== 'string' || !dataType)
    return value;

  const trimmed = value.trim();

  if (dataType === DataTypes.number) {
    if (!NUMERIC_LITERAL_REGEX.test(trimmed))
      return value;

    const parsed = Number(trimmed);

    // keep the literal when the conversion is not lossless, high precision values may legitimately exceed
    // `Number.MAX_SAFE_INTEGER`
    const isLossless = Number.isFinite(parsed) && (Number.isSafeInteger(parsed) || String(parsed) === trimmed);

    return isLossless ? parsed : value;
  }

  if (dataType === DataTypes.boolean) {
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
  }

  return value;
};

/**
 * Resolves the `Default Value` setting of a component into a value that is safe to write into the form model.
 * Returns `undefined` when no default value is configured.
 */
const resolveDefaultValue = (component: IConfigurableFormComponent, payload: IGetFormDefaultValuesPayload, propertyName: string): any => {
  const { evaluator, metadata } = payload;

  if (!isValueSpecified(component.defaultValue))
    return undefined;

  const value = evaluator ? evaluator(component) : component.defaultValue;

  if (!isValueSpecified(value))
    return undefined;

  return convertToDataType(value, getPropertyDataType(propertyName, metadata));
};

/**
 * Collects the default values configured on the inputs of a form.
 *
 * Note: default values are a part of the form model initialization and are intentionally resolved here, on form level,
 * and not by the components themselves. A component can only write into the antd store (through `Form.Item`s
 * `initialValue`), which never raises `onValuesChange` and therefore never reaches the form data that gets submitted.
 */
export const getFormDefaultValues = (payload: IGetFormDefaultValuesPayload): IFormDefaultValue[] => {
  const { flatStructure, toolboxComponents } = payload;
  const allComponents = flatStructure?.allComponents;

  if (!allComponents)
    return [];

  const result: IFormDefaultValue[] = [];

  for (const id in allComponents) {
    if (!allComponents.hasOwnProperty(id)) continue;

    const component = allComponents[id];
    const toolboxComponent = toolboxComponents?.[component.type];

    // skip components that are not bound to the form model: non-inputs and components bound to a data context
    if (!toolboxComponent?.isInput || component.context)
      continue;

    // TODO: calc actual propertyName from JS setting
    if (typeof component.propertyName !== 'string' || component.propertyName.length === 0)
      continue;

    const namePrefix = getNamePrefix(component, allComponents);
    const propertyName = namePrefix ? `${namePrefix}.${component.propertyName}` : component.propertyName;

    const value = resolveDefaultValue(component, payload, propertyName);
    if (value === undefined)
      continue;

    result.push({ propertyName, value });
  }

  return result;
};

/**
 * Applies the passed default values to the form model. Values that are already specified in the model are never
 * overwritten, the model always wins over the configuration.
 *
 * Returns the passed data as is when there is nothing to apply.
 */
export const applyDefaultValues = <TData = any>(data: TData, defaultValues: IFormDefaultValue[]): TData => {
  if (!defaultValues?.length)
    return data;

  let result: TData = data ?? ({} as TData);
  let updated = false;

  defaultValues.forEach(({ propertyName, value }) => {
    if (isValueSpecified(getValueByPropertyName(result, propertyName)))
      return;

    result = setValueByPropertyName(result, propertyName, value, true);
    updated = true;
  });

  return updated ? result : data;
};
