import React, { cloneElement, FC, ReactElement, useState } from 'react';
import { ConfigurableFormItem } from '@/components';
import SettingsControl from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';
import { useStyles } from '../styles/styles';

const FormItem: FC<ISettingsFormItemProps> = (props) => {
  const { styles } = useStyles();
  const { name, label, tooltip, required, hidden, jsSetting, children, valuePropName = 'value', layout } = props;
  const [hasCode, setHasCode] = useState(false);

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
        label: <div className={styles.label} style={{ top: '8px', fontSize: '12px' }}>{label}</div>,
        type: '',
        id: '',
        description: tooltip,
        validate: { required },
        hidden,
        layout,
        size: 'small',

      }}

      className="sha-js-label"
    >
      {(value, onChange) =>
        !jsSetting ? (
          createClonedElement(value, onChange)
        ) : (
          <SettingsControl
            propertyName={name}
            mode="value"
            onChange={onChange}
            value={value}
            setHasCode={setHasCode}
            hasCode={hasCode}
            readOnly={readOnly}
          >
            {(value, onChange) => createClonedElement(value, onChange)}
          </SettingsControl>
        )}
    </ConfigurableFormItem>
  );
};

export default FormItem;
