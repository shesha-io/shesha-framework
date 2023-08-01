import { getPropertySettingsFromValue } from "designer-components/_settings/utils";
import { IConfigurableFormComponent } from "providers";

export const migrateCustomFunctions = <T extends IConfigurableFormComponent,>(prev: T) => {
    return migrateDisabled(migrateHidden(prev));
};

export const migrateHidden = <T extends IConfigurableFormComponent,>(prev: T) => {
    const model = {...prev};

    const hiddenSettings = getPropertySettingsFromValue(prev?.hidden);

    if (Boolean(model['customVisibility']) && !Boolean(hiddenSettings._code)) {
        model.hidden = {
            ...hiddenSettings,
            mode: 'code',
            code: 
`// Automatically updated from customVisibility, please review

return !(() => {
    // Source code

    ${model['customVisibility']}

})();`
        } as any;
        delete model['customVisibility'];
    }
    return model;
};

export const migrateDisabled = <T extends IConfigurableFormComponent,>(prev: T) => {
    const model = {...prev};

    const disabledSettings = getPropertySettingsFromValue(prev?.disabled);

    if (Boolean(model['customEnabled']) && !Boolean(disabledSettings._code)) {
        model.disabled = {
            ...disabledSettings,
            mode: 'code',
            code: 
`// Automatically updated from customEnabled, please review

return !(() => {
    // Source code

    ${model['customEnabled']}

})();`
        } as any;
        delete model['customEnabled'];
    }
    return model;
};

export const migratePropertyName = <T extends IConfigurableFormComponent,>(prev: T) => {
    const name = prev['name'];
    if (!!name && !prev.propertyName)
    return {...prev, componentName: name, propertyName: name} as T;
  else
    return {...prev} as T;
};