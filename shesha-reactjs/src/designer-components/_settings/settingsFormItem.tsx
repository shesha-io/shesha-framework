import React, {
  cloneElement,
  FC,
  ReactElement,
  useEffect,
} from 'react';
import SettingsControl, { SettingsControlChildrenType } from './settingsControl';
import { ConfigurableFormItem, IConfigurableFormItemProps } from '@/components';
import { Form, FormItemProps } from 'antd';
import { getPropertySettingsFromData } from './utils';
import { useSettingsForm } from './settingsForm';
import { useSettingsPanel } from './settingsCollapsiblePanel';
import { getFieldNameFromExpression } from '@/index';

export interface ISettingsFormItemProps extends Omit<IConfigurableFormItemProps, 'model'> {
  name?: string;
  label?: string;
  jsSetting?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  required?: boolean;
  tooltip?: string;
  hidden?: boolean;
  layout?: 'horizontal' | 'vertical';
  hideLabel?: boolean;
  type?: string;
}

const SettingsFormComponent: FC<ISettingsFormItemProps> = (props) => {
  const { model } = useSettingsForm<any>();

  if (!props.name)
    return null;

  const { _mode: mode } = getPropertySettingsFromData(model, props.name?.toString());

  const formProps: FormItemProps = {
    name: getFieldNameFromExpression(props.name),
    label: props.label,
    style: props.style,
    required: props.required,
    tooltip: props.tooltip,
    hidden: props.hidden,
    valuePropName: props.valuePropName,
  };

  if (typeof props.children === 'function') {
    const children = props.children as SettingsControlChildrenType;
    if (!props.jsSetting) {
      return (
        <ConfigurableFormItem
          model={{
            propertyName: props.name,
            label: props.label,
            type: '',
            id: '',
            description: props.tooltip,
            validate: { required: props.required },
            hidden: props.hidden,
          }}
          className="sha-js-label"
        >
          {children}
        </ConfigurableFormItem>
      );
    }

    return (
      <Form.Item {...formProps} label={props.label}>
        <SettingsControl propertyName={props.name} mode={mode}>
          {(value, onChange, propertyName) => children(value, onChange, propertyName)}
        </SettingsControl>
      </Form.Item>
    );
  }

  if (!props.jsSetting) {
    return <Form.Item {...formProps}>{props.children}</Form.Item>;
  }

  const valuePropName = props.valuePropName ?? 'value';
  const children = props.children as ReactElement;
  const readOnly = props.readOnly || children.props.readOnly || children.props.disabled;

  return (
    <ConfigurableFormItem
      model={{
        propertyName: props.name,
        label: props.label,
        type: '',
        id: '',
        description: props.tooltip,
        validate: { required: props.required },
        hidden: props.hidden,
      }}
      className="sha-js-label"
    >
      {(value, onChange) => {
        return (
          <SettingsControl
            propertyName={props.name}
            mode="value"
            onChange={onChange}
            value={value}
            readOnly={readOnly}
          >
            {(value, onChange) => {
              return cloneElement(
                children,
                {
                  ...children?.props,
                  readOnly: readOnly,
                  disabled: readOnly,
                  onChange: (...args: any[]) => {
                    const event = args[0];
                    const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
                      ? (event.target as HTMLInputElement)[valuePropName]
                      : event;
                    onChange(data);
                  },
                  [valuePropName]: value,
                });
            }}
          </SettingsControl>
        );
      }}
    </ConfigurableFormItem>
  );
};

const SettingsFormItem: FC<ISettingsFormItemProps> = (props) => {
  const settingsPanel = useSettingsPanel(false);

  useEffect(() => {
    if (settingsPanel && props.name) {
      settingsPanel.registerField(props.name.toString());
    }
  }, [settingsPanel, props.name]);

  const { propertyFilter } = useSettingsForm<any>();
  return !Boolean(propertyFilter) || (typeof propertyFilter === 'function' && propertyFilter(props.name?.toString()))
    ? <SettingsFormComponent {...props} />
    : null;
};

export default SettingsFormItem;
