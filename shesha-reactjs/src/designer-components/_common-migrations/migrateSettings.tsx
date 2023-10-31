import { getPropertySettingsFromValue } from "../../designer-components/_settings/utils";
import { IConfigurableFormComponent } from "providers";

export const migrateFunctionToProp = <T extends IConfigurableFormComponent,>(
    prev: T,
    propName: string,
    funcPropname: string,
    replaceFunction: (source: string) => string = null,
    invert: Boolean = false,
) => {
    const model = {...prev};

    const propSettings = getPropertySettingsFromValue(prev[propName]);

    if (Boolean(model[funcPropname]) && !Boolean(propSettings._code)) {
        let func = `// Automatically updated from '${funcPropname}', please review\n\n` +
            (invert ? 'return !(() => {\n    // Source code\n\n' : "") +
            model[funcPropname] +
            (invert ? '\n\n})();' : "");

        if (typeof replaceFunction === 'function')
            func = replaceFunction(func);

        model[propName] = {
            ...propSettings, 
            _mode: 'code', 
            _code: func
        };
        delete model[funcPropname];
    }
    return model;
};

export const migrateCustomFunctions = <T extends IConfigurableFormComponent,>(prev: T) => {
    return migrateDisabled(migrateHidden(prev));
};

export const migrateHidden = <T extends IConfigurableFormComponent,>(prev: T) => {
    return migrateFunctionToProp(prev, 'hidden', 'customVisibility', null, true);
};

export const migrateDisabled = <T extends IConfigurableFormComponent,>(prev: T) => {
    return migrateFunctionToProp(prev, 'disabled', 'customEnabled', null, true);
};

export const migratePropertyName = <T extends IConfigurableFormComponent,>(prev: T) => {
    const name = prev['name'];
    if (!!name && !prev.propertyName)
    return {...prev, componentName: name, propertyName: name} as T;
  else
    return {...prev} as T;
};