import { EditMode, IConfigurableFormComponent } from '@/providers';
import { getPropertySettingsFromValue, isPropertySettings } from '@/designer-components/_settings/utils';

export const migrateFunctionToProp = <T extends IConfigurableFormComponent>(
  prev: T,
  propName: string,
  funcPropname: string,
  replaceFunction: (source: string) => string = null,
  invert: Boolean = false,
): T => {
  const model = { ...prev };

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
      _code: func,
    };
    delete model[funcPropname];
  }
  return model;
};

export const migrateHidden = <T extends IConfigurableFormComponent>(prev: T): T => {
  return migrateFunctionToProp(prev, 'hidden', 'customVisibility', null, true);
};

export const migrateDisabled = <T extends IConfigurableFormComponent>(prev: T): T => {
  return migrateFunctionToProp(prev, 'disabled', 'customEnabled', null, true);
};

export const migrateCustomFunctions = <T extends IConfigurableFormComponent>(prev: T): T => {
  return migrateDisabled(migrateHidden(prev));
};

export const migratePropertyName = <T extends IConfigurableFormComponent>(prev: T): T => {
  const name = prev['name'];
  if (!!name && !prev.propertyName)
    return { ...prev, componentName: name, propertyName: name } as T;
  else
    return { ...prev } as T;
};

export const migrateReadOnly = <T>(prev: T, defaultValue?: EditMode): T => {
  const disabled = prev['disabled'];
  const readOnly = prev['readOnly'];
  const model = {
    ...prev, editMode:
      (readOnly === true && disabled === true) ||
      (readOnly === true && !disabled) ||
      (disabled === true && !readOnly)
        ? 'readOnly'
        : readOnly === true && !!disabled && disabled['_mode'] === 'code'
          ? { _value: 'readOnly', _mode: 'value', _code: disabled['_code'] }
          : !readOnly && !!disabled && disabled['_mode'] === 'code'
            ? { _value: 'inherited', _mode: 'code', _code: disabled['_code'] }
            : undefined,
  } as T;

  if (isPropertySettings(model['editMode'])) {
    const func = `// Automatically updated from 'disabled' property, please review\n\n` +
      'return !(() => {\n    // Source code\n\n' +
      model['editMode']['_code'] +
      '\n\n})();';

    model['editMode'] = { ...model['editMode'] as any, _code: func };
  }

  if (!model['editMode'] && !!defaultValue)
    model['editMode'] = defaultValue;

  // delete model.disabled;
  return model;
};
