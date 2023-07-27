import { IContainerComponentProps } from "designer-components/container/interfaces";
import { IConfigurableFormComponent, IPropertySetting, IToolboxComponents } from "interfaces";
import { nanoid } from "nanoid";

export const isPropertySettings = (data: any) => {
    if (typeof data !== 'object')
        return false;
    
    if (data.hasOwnProperty('_mode')
        && (data._mode === 'code' || data._mode === 'value'))
        /*&& data.hasOwnProperty('_value') 
        && data.hasOwnProperty('_code')
        && Object.keys(data).length === 3)*/
        return true;
    
    return false;
};

export const getPropertySettingsFromData = (data: any, propName: string): IPropertySetting => {
    const propNames = propName.split('.');
    let val = data;
    propNames.forEach(p => {
        val = val?.[p];
    });

    if (isPropertySettings(val))
        return val;
    else
        return { _mode: 'value', _code: undefined, _value: val };
};

export const getPropertySettingsFromValue = (value: any): IPropertySetting => {
    if (isPropertySettings(value))
        return value;
    else
        return { _mode: 'value', _code: undefined, _value: value };
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
    components: IConfigurableFormComponent[]) => {

        const processComponent = (component: IConfigurableFormComponent) => {
  
        const newComponent: IConfigurableFormComponent = {...component};
  
        if (component.type?.startsWith('setting.')) {
            // If should be wrapped as Setting
            newComponent.type = 'setting';
            newComponent.id = nanoid();
        
            // Add source component as a child of Setting component
            if (Array.isArray(component['components']) && component['components'].length > 0) {
                newComponent['components'] = [{
                    ...component,
                    type: component.type.replace('setting.', ''),
                    components: component['components'].map(c => {
                        return processComponent(c);
                    }),
                    parentId: newComponent.id
                }] as IContainerComponentProps[];
            } else {
                newComponent['components'] = [{
                    ...component,
                    type: component.type.replace('setting.', ''),
                    parentId: newComponent.id
                }] as IConfigurableFormComponent[];
            }
            return newComponent;
        } else {
            // If should not be wrapped as Setting then check all child containers
            const componentRegistration = toolboxComponents[component.type];

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
        }
    };
  
    return components.map(c => {
        return processComponent(c);
    });
};
  
export const migrateHidden = (prev: IConfigurableFormComponent) => {
    const model = {...prev};
    /*if (Boolean(model.customVisibility) && !Boolean(model.hidden_setting?.code)) {
        model.hidden_setting = {
            ...model.hidden_setting,
            mode: 'code',
            code: 
`// Automatically updated from customVisibility, please review

return !(() => {
    // Source code

    ${model.customVisibility}

})();`
        };
        model.customVisibility = undefined;
    }*/
    return model;
};

export const migrateDisabled = (prev: IConfigurableFormComponent) => {
    const model = {...prev};
    /*if (Boolean(model.customEnabled) && !Boolean(model.disabled_setting?.code)) {
        model.disabled_setting = {
            ...model.disabled_setting,
            mode: 'code',
            code: 
`// Automatically updated from customEnabled, please review

return !(() => {
    // Source code

    ${model.customEnabled}

})();`
        };
        model.customEnabled = undefined;
    }*/
    return model;
};

export const migratePropertyName = <T extends IConfigurableFormComponent,>(prev: T) => {
    const name = prev['name'];
    if (!!name && !prev.propertyName)
    return {...prev, componentName: name, propertyName: name} as T;
  else
    return {...prev} as T;
};

export const getPropertySetting = (model: any, propertyName: string): IPropertySetting => {
    return model?.[propertyName + '_setting'];
};