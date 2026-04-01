import React, { cloneElement, FC, ReactElement, useState } from 'react';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import SettingsControl from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';
import { useStyles } from '../styles/styles';
import { useDefaultModelProviderStateOrUndefined } from '../defaultModelProvider/defaultModelProvider';
import { getValueByPropertyName } from '@/utils/object';
import { useFormItem } from '@/index';

const FormItem: FC<ISettingsFormItemProps> = (props) => {
  const { styles } = useStyles();
  const { name, label, tooltip, required, hidden, jsSetting, children, valuePropName = 'value', layout, availableConstantsExpression } = props;
  const [hasCode, setHasCode] = useState(false);

  const { namePrefix } = useFormItem();
  const defaultModelPropName = namePrefix ? namePrefix + '.' + name : name;

  const defaultModel = useDefaultModelProviderStateOrUndefined();
  const valueInfo = defaultModel?.getValueInfo(defaultModelPropName);
  const defaultValue = getValueByPropertyName(defaultModel?.getDefaultModel() as Record<string, unknown>, defaultModelPropName);
  const className = valueInfo?.state === 'usedDefault' ? styles.inheritedValue : valueInfo?.state === 'usedModel' ? styles.overriddenValue : '';

  const childElement = children as ReactElement;
  const readOnly = props.readOnly || childElement.props.readOnly || childElement.props.disabled;

  const handleChange = (onChange) => (...args: any[]) => {
    const event = args[0];
    const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
      ? (event.target as HTMLInputElement)[valuePropName]
      : event;
    onChange(data);
  };

  const createClonedElement = (value, onChange): ReactElement => cloneElement(
    childElement,
    {
      ...childElement?.props,
      readOnly: readOnly,
      size: 'small',
      disabled: readOnly,
      onChange: handleChange(onChange),
      [valuePropName]: value,
    },
  );

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
        const localValue = valueInfo?.state === 'usedDefault' ? defaultValue : value;
        return !jsSetting ? (
          createClonedElement(localValue, onChange)
        ) : (
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
            {(val, onChange) => createClonedElement(val, onChange)}
          </SettingsControl>
        );
      }}
    </ConfigurableFormItem>
  );
};

export default FormItem;
