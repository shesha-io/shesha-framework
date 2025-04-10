import { IContainerComponentProps } from '@/designer-components/container/interfaces';
import React from 'react';
import { IComponentsDictionary, IConfigurableFormComponent, IPropertySetting, IToolboxComponents } from '@/interfaces';
import { useStyles } from './styles/styles';

/**
 * Checks if the provided data is an instance of IPropertySetting.
 *
 * @param {any} data - The data to be checked
 * @return {boolean} Indicates whether the data is an instance of IPropertySetting
 */
export const isPropertySettings = <Value = any,>(data: any): data is IPropertySetting<Value> => {
  if (!data || typeof data !== 'object') return false;

  const typed = data as IPropertySetting;
  return typed._mode === 'code' || typed._mode === 'value';
};

export const getPropertySettingsFromData = (data: any, propName: string): IPropertySetting => {
  if (!propName || !data) return { _mode: 'value', _code: undefined, _value: undefined };

  const propNames = propName.split('.');
  let val = data;
  propNames.forEach((p) => {
    val = val?.[p];
  });

  if (isPropertySettings(val)) return val;
  else return { _mode: 'value', _code: undefined, _value: val };
};

export const updateSettingsFromValues = <T,>(model: T, values: T): T => {
  const copy = { ...model };
  Object.keys(values).forEach((k) => {
    if (isPropertySettings(copy[k]) && !isPropertySettings(values[k])) copy[k]._value = values[k];
    else copy[k] = values[k];
  });
  return copy;
};

export const getValueFromPropertySettings = (value: any): any => {
  if (isPropertySettings(value)) return value._value;
  else return value;
};

export const getValuesFromSettings = <T,>(model: T): T => {
  const copy = { ...model };
  Object.keys(copy).forEach((k) => {
    copy[k] = getValueFromPropertySettings(copy[k]);
  });
  return copy;
};

export const getPropertySettingsFromValue = (value: any): IPropertySetting => {
  if (!isPropertySettings(value) || !value) return { _mode: 'value', _code: undefined, _value: value };
  else return value;
};

/**
 * Update structure of components to use with Setting component
 *
 * @param toolboxComponents List of Toolbox components
 * @param components Components structure
 * @returns Updated components structure
 */
export const updateSettingsComponents = (
  toolboxComponents: IToolboxComponents,
  components: IConfigurableFormComponent[]
) => {
  const processComponent = (component: IConfigurableFormComponent) => {
    const componentRegistration = toolboxComponents[component.type];

    const newComponent: IConfigurableFormComponent = { ...component, jsSetting: false };
    if ((componentRegistration?.canBeJsSetting && component.jsSetting !== false) || component.jsSetting === true) {
      const oldComponent: IConfigurableFormComponent = { ...newComponent };

      // If should be wrapped as Setting
      newComponent.type = 'setting';
      newComponent.id = oldComponent.id + '_setting';

      // copy `exposedVariables`. NOTE: it's a temporary solution, will be removed later
      if (oldComponent['exposedVariables']) newComponent['exposedVariables'] = oldComponent['exposedVariables'];

      // Add source component as a child of Setting component
      if (Array.isArray(oldComponent['components']) && oldComponent['components'].length > 0) {
        newComponent['components'] = [
          {
            ...oldComponent,
            components: oldComponent['components'].map((c) => {
              return processComponent(c);
            }),
            parentId: newComponent.id,
          } as IContainerComponentProps,
        ];
      } else {
        newComponent['components'] = [
          {
            ...oldComponent,
            parentId: newComponent.id,
          } as IConfigurableFormComponent,
        ];
      }
      return newComponent;
    } else {
      // If should not be wrapped as Setting then check all child containers

      // custom containers
      const customContainerNames = componentRegistration?.customContainerNames || [];
      customContainerNames.forEach((subContainer) => {
        if (Array.isArray(component[subContainer]?.components) && component[subContainer]?.components.length > 0)
          newComponent[subContainer].components = component[subContainer]?.components.map((c) => {
            return processComponent(c);
          });
      });

      // default container
      if (Array.isArray(component['components']) && component['components'].length > 0)
        newComponent['components'] = component['components'].map((c) => {
          return processComponent(c);
        });

      return newComponent;
    }
  };

  return components.map((c) => {
    return processComponent(c);
  });
};

export const updateJsSettingsForComponents = (
    toolboxComponents: IToolboxComponents,
    components: IConfigurableFormComponent[]) => {

    const processComponent = (component: IConfigurableFormComponent) => {
        const componentRegistration = toolboxComponents[component.type];
        const newComponent: IConfigurableFormComponent = { 
          ...component,
          jsSetting: componentRegistration?.canBeJsSetting && component.jsSetting !== false || component.jsSetting === true
        };

        // Check all child containers
        // custom containers
        const customContainerNames = componentRegistration?.customContainerNames || [];
        customContainerNames.forEach(subContainer => {
            if (Array.isArray(component[subContainer]?.components) && component[subContainer]?.components.length > 0)
                newComponent[subContainer].components = component[subContainer]?.components.map(c => {
                    return processComponent(c);
                });
        });

        // default container
        if (Array.isArray(component['components']) && component['components'].length > 0)
            newComponent['components'] = component['components'].map(c => {
                return processComponent(c);
            });

        return newComponent;
    };

    return components.map(c => {
        return processComponent(c);
    });
};

export const updateSettingsComponentsDict = (
  toolboxComponents: IToolboxComponents,
  components: IComponentsDictionary
) => {
  const comps: IConfigurableFormComponent[] = [];

  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      comps.push(components[key]);
    }
  }

  const updComps = updateSettingsComponents(toolboxComponents, comps);

  const res: IComponentsDictionary = {};
  updComps.forEach((comp) => {
    res[comp.id] = comp;
  });

  return res;
};

export const StyledLabel = ({ label }: { label: string }) => {
  const { styles } = useStyles();

  return <span className={styles.label}>{label}</span>;
};