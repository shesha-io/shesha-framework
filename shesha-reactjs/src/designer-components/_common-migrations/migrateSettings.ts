import { EditMode, IConfigurableFormComponent, IPropertySetting } from '@/providers';
import { getPropertySettingsFromValue, isPropertySettings } from '@/designer-components/_settings/utils';

export const migrateFunctionToProp = <T = unknown>(
  prev: T,
  propName: string,
  funcPropname: string,
  replaceFunction: ((source: string) => string) | undefined = undefined,
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

export const migratePropToInverseProp = <T, V>(prev: T, fromProp: string, toProp: string, inverseFunc?: (value: V | IPropertySetting<V>) => V | IPropertySetting<V>, defaultValue?: V | IPropertySetting<V>): T => {
  const from = prev[fromProp];
  const model = {
    ...prev,
    [toProp]:
      isPropertySettings(from)
        ? { ...from }
        : typeof from === 'boolean'
          ? !from
          : typeof inverseFunc === 'function'
            ? inverseFunc(from)
            : from,
  } as T;

  if (isPropertySettings(model[toProp])) {
    const existingCode = model[toProp]['_code'];
    if (!existingCode) return model;
    const func = `// Automatically updated from '${fromProp}' property, please review\n\nreturn !(() => {\n    // Source code\n\n${existingCode}\n\n})();`;
    model[toProp] = { ...model[toProp] as IPropertySetting<V>, _code: func, _value: model[toProp]['_value'] };
  }

  if (model[toProp] === undefined && defaultValue !== undefined)
    model[toProp] = defaultValue;

  return model;
};

export const migrateHiddenToVisible = <T>(prev: T): T => {
  const newModel = migratePropToInverseProp(prev, 'hidden', 'visible');
  delete newModel['hidden'];
  return newModel;
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

  return migratePropToInverseProp(model, 'editMode', 'editMode', undefined, defaultValue);
};
