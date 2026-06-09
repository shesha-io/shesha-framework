import React, { cloneElement, FC, ReactElement, useState } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import SettingsControl, { SettingsControlChildrenFunc } from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';
import { useStyles } from '../styles/styles';
import { useDefaultModelPropertyUpdateSubscription, useDefaultModelActionsOrUndefined } from '../defaultModelProvider/defaultModelProvider';
import { getValueByPropertyName } from '@/utils/object';
import { useFormItem } from '@/providers';
import PermissionsControl from '../permissionsControl';

const FormItem: FC<ISettingsFormItemProps> = (props) => {
  const { styles } = useStyles();
  const { name, label, tooltip, required, hidden, jsSetting, children, valuePropName = 'value', layout, availableConstantsExpression, permissionSettings } = props;
  const [hasCode, setHasCode] = useState(false);

  useDefaultModelPropertyUpdateSubscription(name);

  const { namePrefix } = useFormItem();
  const defaultModelPropName = namePrefix ? namePrefix + '.' + name : name;

  const defaultModel = useDefaultModelActionsOrUndefined();
  const valueInfo = defaultModel?.getValueInfo(defaultModelPropName);
  const defaultValue = getValueByPropertyName(defaultModel?.getDefaultModel() as Record<string, unknown>, defaultModelPropName);
  const className = valueInfo?.state === 'usedDefault' ? styles.inheritedValue : valueInfo?.state === 'usedModel' ? styles.overriddenValue : '';

  let childFunc: SettingsControlChildrenFunc | undefined = undefined;
  let readOnly = props.readOnly;
  if (typeof children === 'function') {
    childFunc = children as SettingsControlChildrenFunc;
  } else {
    const childElement = children as ReactElement;
    readOnly = readOnly || childElement.props.readOnly || childElement.props.disabled;

    childFunc = (value, onChange): ReactElement => cloneElement(
      childElement,
      {
        ...childElement.props,
        readOnly: readOnly,
        size: 'small',
        disabled: readOnly,
        onChange: (...args: any[]) => {
          const event = args[0];
          const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
            ? (event.target as HTMLInputElement)[valuePropName]
            : event;
          onChange(data);
        },
        [valuePropName]: value,
      },
    );
  }

  const permissionPropertyName = name + 'Permissions';

  return (
    <ConfigurableFormItem
      model={{
        hideLabel: props.hideLabel,
        propertyName: name,
        label: <div className={styles.label}>{label}</div>,
        type: '',
        id: '',
        description: tooltip,
        validate: { required },
        hidden,
        layout,
        size: 'small',
      }}
      className={`sha-js-label ${className}`}
    >
      {(value, onChange) => {
        const localValue = defaultModel?.getValueInfo(defaultModelPropName)?.state === 'usedDefault' ? defaultValue : value;
        return !jsSetting ? (
          <PermissionsControl enabled={permissionSettings} propertyName={permissionPropertyName} readOnly={readOnly}>
            {childFunc(localValue, onChange, name)}
          </PermissionsControl>
        ) : (
          <PermissionsControl enabled={permissionSettings} propertyName={permissionPropertyName} readOnly={readOnly}>
            <SettingsControl
              propertyName={name}
              mode="value"
              onChange={onChange}
              value={localValue}
              setHasCode={setHasCode}
              hasCode={hasCode}
              readOnly={readOnly}
              lazy={jsSetting === 'lazy'}
              availableConstantsExpression={availableConstantsExpression}
            >
              {(val1, onChange1) => childFunc(val1, onChange1, name)}
            </SettingsControl>
          </PermissionsControl>
        );
      }}
    </ConfigurableFormItem>
  );
};

export default FormItem;
