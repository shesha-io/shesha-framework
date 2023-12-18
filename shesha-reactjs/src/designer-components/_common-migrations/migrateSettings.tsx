import { getPropertySettingsFromValue, isPropertySettings } from "@/designer-components/_settings/utils";
import { IConfigurableFormComponent, EditMode } from "@/providers";

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

export const migrateReadOnly = <T extends IConfigurableFormComponent,>(prev: T, defaultValue?: EditMode) => {
  const disabled = prev['disabled'];
  const model = {...prev, editMode: 
    prev.readOnly === true
      ? !!disabled && disabled['_mode'] === 'code'
        ? {_value: true, _mode: 'value', _code: disabled['_code']}
        : true
    : disabled || prev.readOnly} as T;

  if (isPropertySettings(model.editMode)) {
    const func = `// Automatically updated from 'disabled' property, please review\n\n` +
      'return !(() => {\n    // Source code\n\n' +
      model.editMode['_code'] +
      '\n\n})();';

    model.editMode = {...model.editMode as any, _code: func};
  }

  if (!model.editMode && !!defaultValue) 
    model.editMode = defaultValue;

  //delete model.disabled;
  return model;
};