import React from 'react';
import { IConfigurableFormComponent, IPropertySetting, IToolboxComponents } from '@/interfaces';
import { useStyles } from '../styles/styles';
import { getNestedPropertyValue } from '@/utils/dotnotation';
import { isDefined } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';

/**
 * Checks if the provided data is an instance of IPropertySetting.
 *
 * @param {any} data - The data to be checked
 * @return {boolean} Indicates whether the data is an instance of IPropertySetting
 */
export const isPropertySettings = <Value = unknown>(data: unknown): data is IPropertySetting<Value> => {
  if (!data || typeof data !== 'object') return false;

  const typed = data as IPropertySetting;
  return typed._mode === 'code' || typed._mode === 'value';
};

export const getPropertySettingsFromData = (data: unknown, propName: string): IPropertySetting => {
  if (!propName || !data) return { _mode: 'value', _code: undefined, _value: undefined };

  const val = getNestedPropertyValue(data, propName);

  if (isPropertySettings(val)) return val;
  else return { _mode: 'value', _code: undefined, _value: val };
};

export const updateSettingsFromValues = <T extends object = object>(model: T, values: Partial<T>): T => {
  const copy = { ...model };
  Object.keys(values).forEach((k) => {
    const key = k as keyof T;
    if (isPropertySettings(copy[key]) && !isPropertySettings(values[key])) copy[key]._value = values[key];
    else copy[key] = values[key]!;
  });
  return copy;
};

export const getValueFromPropertySettings = (value: unknown): unknown => {
  if (isPropertySettings(value)) return value._value;
  else return value;
};

export const getValuesFromSettings = <T extends object = object>(model: T): T => {
  const copy = { ...model };
  Object.keys(copy).forEach((k) => {
    const key = k as keyof T;
    copy[key] = getValueFromPropertySettings(copy[key]) as T[keyof T];
  });
  return copy;
};

export const getPropertySettingsFromValue = <Value = unknown>(value: Value | IPropertySetting<Value>): IPropertySetting<Value> => {
  if (isPropertySettings(value))
    return value as IPropertySetting<Value>;
  else
    return { _mode: 'value', _code: undefined, _value: value };
};

const STANDARD_COMPONENTS_CONTAINER = "components";

export const updateJsSettingsForComponents = (
  toolboxComponents: IToolboxComponents,
  components: IConfigurableFormComponent[]): IConfigurableFormComponent[] => {
  const processComponent = <TComponent extends IConfigurableFormComponent = IConfigurableFormComponent>(component: TComponent): TComponent => {
    const componentRegistration = toolboxComponents[component.type];
    const newComponent: TComponent = {
      ...component,
      jsSetting: component.jsSetting === 'lazy'
        ? 'lazy'
        : (componentRegistration?.canBeJsSetting && component.jsSetting !== false) || component.jsSetting === true,
    };

    // Check all child containers
    // custom containers
    const customContainerNames = (componentRegistration?.customContainerNames || []) as (keyof TComponent) [];
    customContainerNames.forEach((subContainer) => {
      const container = component[subContainer];
      const componentsKey = STANDARD_COMPONENTS_CONTAINER as keyof typeof container;
      const containerComponents = isDefined(container) && typeof (container) === "object" && componentsKey in container
        ? container[componentsKey] as IConfigurableFormComponent[]
        : undefined;

      if (Array.isArray(containerComponents) && isNonEmptyArray(containerComponents))
        if (newComponent[subContainer] && typeof (newComponent[subContainer]) === "object") {
          (newComponent[subContainer] as Record<string, unknown>)[STANDARD_COMPONENTS_CONTAINER] = containerComponents.map((c) => {
            return processComponent(c);
          });
        }
    });

    // default container
    const standardContainerKey = "components" as keyof TComponent;
    if (standardContainerKey in component && Array.isArray(component[standardContainerKey]) && component[standardContainerKey].length > 0) {
      const container = component[standardContainerKey] as IConfigurableFormComponent[];
      (newComponent[standardContainerKey] as IConfigurableFormComponent[]) = container.map((c) => {
        return processComponent(c);
      });
    }

    return newComponent;
  };

  return components.map((c) => {
    return processComponent(c);
  });
};

export const StyledLabel = ({ label }: { label: string }): React.JSX.Element => {
  const { styles } = useStyles();

  return <span className={styles.label}>{label}</span>;
};
