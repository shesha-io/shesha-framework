import { SettingsMigrationContext } from "../../../..";
import { IConfigurableActionConfiguration } from "../../../../interfaces/configurableAction";

export const upgradeActionConfig = (config: IConfigurableActionConfiguration, context: SettingsMigrationContext): IConfigurableActionConfiguration => {
    if (!config)
        return config;

    const newOwner = getActionOwner(config.actionOwner, context);
    
    return { 
        ...config, 
        actionOwner: newOwner,
        onFail: upgradeActionConfig(config.onFail, context),
        onSuccess: upgradeActionConfig(config.onSuccess, context),
    };
}

const actionOwnerTypes = ['datatableContext', 'subForm', 'list', 'wizard'];
const getActionOwner = (value: string, context: SettingsMigrationContext) => {
    if (!value)
        return value;

    // convert standard actions
    if (value === 'Common')
        return 'shesha.common';
    if (value === 'Configuration Framework')
        return 'shesha.configurationFramework';
    if (value === 'Form')
        return 'shesha.form';

    const { allComponents } = context.flatStructure;
    for (const id in allComponents){
        const component = allComponents[id];
        const uniqueStateId = component['uniqueStateId'];
        if (uniqueStateId === value){
            //console.log(`upgrade: ${value} found in ${component.type} (${component.id})`);
            
            if (actionOwnerTypes.includes(component.type)){
                //console.log(`identified as an action owner - use this`);
                return component.id;
            }
        }
    }
    
    return value;
}