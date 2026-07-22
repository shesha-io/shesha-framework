import { EditMode, IPropertySetting } from '@/providers';
import { getPropertySettingsFromValue, isPropertySettings } from '@/designer-components/_settings/utils/utils';
import { getStringPropertyOrUndefined } from '@/utils/object';
import { isDefined } from '@/utils/nullables';

export const migrateFunctionToProp = <T extends object = object>(
  prev: T,
  propNameRaw: string,
  funcPropnameRaw: string,
  replaceFunction: ((source: string) => string) | undefined = undefined,
  invert: boolean = false,
): T => {
  const model = { ...prev };

  const propName = propNameRaw as keyof T;
  const funcPropname = funcPropnameRaw as keyof T;

  const propSettings = getPropertySettingsFromValue(prev[propName]);

  if (Boolean(model[funcPropname]) && !Boolean(propSettings._code)) {
    let func = `// Automatically updated from '${String(funcPropname)}', please review\n\n` +
      (invert ? 'return !(() => {\n    // Source code\n\n' : "") +
      model[funcPropname] +
      (invert ? '\n\n})();' : "");

    if (typeof replaceFunction === 'function')
      func = replaceFunction(func);

    model[propName] = {
      ...propSettings,
      _mode: 'code',
      _code: func,
    } as T[keyof T];
    delete model[funcPropname];
  }
  return model;
};

export const migrateHidden = <T extends object = object>(prev: T): T => {
  return migrateFunctionToProp(prev, 'hidden', 'customVisibility', undefined, true);
};

export const migrateDisabled = <T extends object = object>(prev: T): T => {
  return migrateFunctionToProp(prev, 'disabled', 'customEnabled', undefined, true);
};

export const migrateCustomFunctions = <T extends object = object>(prev: T): T => {
  return migrateDisabled(migrateHidden(prev));
};

export const migratePropertyName = <T extends object = object>(prev: T): T => {
  const name = getStringPropertyOrUndefined(prev, "name");
  const propertyName = getStringPropertyOrUndefined(prev, "propertyName");
  if (!!name && !propertyName)
    return { ...prev, componentName: name, propertyName: name } as T;
  else
    return { ...prev } as T;
};

export const migratePropToInverseProp = <T, V>(prev: T, fromProp: keyof T, toProp: keyof T, inverseFunc?: (value: V | IPropertySetting<V>) => V | IPropertySetting<V>, defaultValue?: V | IPropertySetting<V>): T => {
  const from = prev[fromProp];
  const model = {
    ...prev,
    [toProp]:
      isPropertySettings(from)
        ? { ...from }
        : typeof from === 'boolean'
          ? !from
          : typeof inverseFunc === 'function'
            ? inverseFunc(from as V)
            : from,
  } as T;

  if (isPropertySettings(model[toProp])) {
    const existingCode = model[toProp]['_code'];
    if (!existingCode) return model;
    const func = `// Automatically updated from '${String(fromProp)}' property, please review\n\nreturn !(() => {\n    // Source code\n\n${existingCode}\n\n})();`;
    model[toProp] = { ...model[toProp] as IPropertySetting<V>, _code: func, _value: model[toProp]['_value'] } as T[keyof T];
  }

  if (model[toProp] === undefined && defaultValue !== undefined)
    model[toProp] = defaultValue as T[keyof T];

  return model;
};

export const migrateHiddenToVisible = <T>(prev: T): T => {
  const newModel = migratePropToInverseProp(prev, 'hidden' as keyof T, 'visible' as keyof T);
  delete newModel['hidden' as keyof T];
  return newModel;
};

export const migrateReadOnly = <T>(prev: T, defaultValue?: EditMode): T => {
  const disabled = prev['disabled' as keyof T];
  const readOnly = prev['readOnly' as keyof T];

  const disabledMode = isDefined(disabled) && typeof (disabled) === 'object' ? getStringPropertyOrUndefined(disabled, '_mode') : undefined;
  const disabledCode = isDefined(disabled) && typeof (disabled) === 'object' ? getStringPropertyOrUndefined(disabled, '_code') : undefined;

  const model = {
    ...prev,
    editMode:
      (readOnly === true && disabled === true) ||
      (readOnly === true && !disabled) ||
      (disabled === true && !readOnly)
        ? 'readOnly'
        : readOnly === true && !!disabled && disabledMode === 'code'
          ? { _value: 'readOnly', _mode: 'value', _code: disabledCode }
          : !readOnly && !!disabled && disabledMode === 'code'
            ? { _value: 'inherited', _mode: 'code', _code: disabledCode }
            : undefined,
  } as T;

  return migratePropToInverseProp(model, 'editMode' as keyof T, 'editMode' as keyof T, undefined, defaultValue);
};
