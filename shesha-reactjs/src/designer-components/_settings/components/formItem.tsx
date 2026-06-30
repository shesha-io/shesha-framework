import React, { cloneElement, FC, ReactElement, useState, isValidElement, SyntheticEvent } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import SettingsControl, { SettingsControlChildrenFunc } from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';
import { useStyles } from '../styles/styles';
import { useDefaultModelPropertyUpdateSubscription, useDefaultModelActionsOrUndefined } from '../defaultModelProvider/defaultModelProvider';
import { getValueByPropertyName } from '@/utils/object';
import { useFormItem } from '@/providers';
import { IAnyObject } from '@/interfaces';
import { isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import PermissionsControl from '../permissionsControl';

type ChildProps = {
  readOnly: boolean | undefined;
  disabled: boolean | undefined;
  size?: SizeType;
};

const FormItem: FC<ISettingsFormItemProps> = (props) => {
  const { styles } = useStyles();
  const { name, label, tooltip, required, validationDependencies, hidden, jsSetting, children, valuePropName = 'value', layout, availableConstantsExpression, permissionSettings } = props;
  const [hasCode, setHasCode] = useState(false);

  useDefaultModelPropertyUpdateSubscription(name);

  const { namePrefix } = useFormItem();
  const defaultModelPropName = isNotNullOrWhiteSpace(namePrefix) ? namePrefix + '.' + name : name;

  const defaultModel = useDefaultModelActionsOrUndefined();
  const valueInfo = defaultModel?.getValueInfo(defaultModelPropName);
  const defaultValue = getValueByPropertyName(defaultModel?.getDefaultModel() as Record<string, unknown>, defaultModelPropName);
  const className = valueInfo?.state === 'usedDefault' ? styles.inheritedValue : valueInfo?.state === 'usedModel' ? styles.overriddenValue : '';

  let childFunc: SettingsControlChildrenFunc = () => <></>;
  let readOnly = props.readOnly ?? false;
  if (typeof children === 'function') {
    childFunc = children as SettingsControlChildrenFunc;
  } else {
    if (isValidElement(children)) {
      const childrenElement = children as React.ReactElement<ChildProps & IAnyObject>;
      const childProps = childrenElement.props;
      readOnly = readOnly || (childProps.readOnly ?? false) || (childProps.disabled ?? false);

      childFunc = (value, onChange): ReactElement => cloneElement(
        childrenElement,
        {
          ...childProps,
          readOnly: readOnly,
          size: 'small',
          disabled: readOnly,
          onChange: (event: SyntheticEvent) => {
            const { target } = event;
            const data = !isNullOrWhiteSpace(valuePropName) && typeof target === 'object' && valuePropName in target
              ? target[valuePropName as keyof typeof target]
              : event;
            onChange(data);
          },
          [valuePropName]: value,
        },
      );
    }
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
        validationDependencies,
        hidden,
        layout,
        size: 'small',
      }}
      className={`sha-js-label ${className}`}
    >
      {(value, onChange) => {
        const localValue = defaultModel?.getValueInfo(defaultModelPropName)?.state === 'usedDefault' ? defaultValue : value;
        return !Boolean(jsSetting) ? (
          <PermissionsControl enabled={permissionSettings ?? false} propertyName={permissionPropertyName} readOnly={readOnly}>
            {childFunc(localValue, onChange, name)}
          </PermissionsControl>
        ) : (
          <PermissionsControl enabled={permissionSettings ?? false} propertyName={permissionPropertyName} readOnly={readOnly}>
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
