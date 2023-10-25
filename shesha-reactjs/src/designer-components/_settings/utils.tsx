import { IContainerComponentProps } from "../../designer-components/container/interfaces";
import { IComponentsDictionary, IConfigurableFormComponent, IPropertySetting, IToolboxComponents } from "interfaces";
import { nanoid } from "nanoid";

export const isPropertySettings = (data: any) => {
    if (!data || typeof data !== 'object')
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
    if (!propName) 
        return { _mode: 'value', _code: undefined, _value: undefined };

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

export const getValueFromPropertySettings = (value: any): IPropertySetting => {
    if (isPropertySettings(value))
        return value._value;
    else
        return value;
};

export const getPropertySettingsFromValue = (value: any): IPropertySetting => {
    if (isPropertySettings(value))
        return value;
    else
        return { _mode: 'value', _code: undefined, _value: value };
};

export const updateSettingsComponentsDict = ( 
    toolboxComponents: IToolboxComponents,
    components: IComponentsDictionary) => {
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

            const componentRegistration = toolboxComponents[component.type];

            const newComponent: IConfigurableFormComponent = {...component, jsSetting: false};
    
            if (componentRegistration?.canBeJsSetting && (component.jsSetting !== false) 
                || component.jsSetting === true) {

                const oldComponent: IConfigurableFormComponent = {...newComponent};

                // If should be wrapped as Setting
                newComponent.type = 'setting';
                newComponent.id = nanoid();
            
                // Add source component as a child of Setting component
                if (Array.isArray(oldComponent['components']) && oldComponent['components'].length > 0) {
                    newComponent['components'] = [{
                        ...oldComponent,
                        components: oldComponent['components'].map(c => {
                            return processComponent(c);
                        }),
                        parentId: newComponent.id
                    }] as IContainerComponentProps[];
                } else {
                    newComponent['components'] = [{
                        ...oldComponent,
                        parentId: newComponent.id
                    }] as IConfigurableFormComponent[];
                }
                return newComponent;
            } else {
                // If should not be wrapped as Setting then check all child containers

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
