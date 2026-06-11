import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import { IConfigurableFormItemProps } from '@/components/formDesigner/components/model';
import { GetAvailableConstantsFunc } from "@/designer-components/codeEditor/interfaces";
import { getFieldNameFromExpression } from '@/providers/form/utils';
import { isChangeEvent } from '@/utils/events';
import { isDefined } from '@/utils/nullables';
import { getBooleanPropertyOrUndefined } from '@/utils/object';
import { Form, FormItemProps } from 'antd';
import React, {
  cloneElement,
  FC, ReactNode,
  useEffect,
} from 'react';
import { IPropertySetting } from '../..';
import { useSettingsPanel } from './settingsCollapsiblePanel';
import SettingsControl, { SettingsControlChildrenType } from './settingsControl';
import { useSettingsForm } from './settingsForm';
import { getPropertySettingsFromData } from './utils/utils';

export interface ISettingsFormItemProps extends Omit<IConfigurableFormItemProps, 'model' | 'children'> {
  readonly children?: SettingsControlChildrenType | undefined;
  id?: string | undefined;
  name: string;
  label?: string | React.ReactNode;
  jsSetting?: boolean | 'lazy' | undefined;
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  style?: React.CSSProperties | undefined;
  required?: boolean | undefined;
  tooltip?: string | undefined;
  hidden?: boolean | undefined;
  layout?: 'horizontal' | 'vertical' | undefined;
  hideLabel?: boolean | undefined;
  type?: string | undefined;
  availableConstantsExpression?: string | GetAvailableConstantsFunc | undefined;
}

type WrappedComponentProps = {
  readOnly: boolean;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement> | unknown) => void;
};

const SettingsFormComponent = <Value = unknown>(props: ISettingsFormItemProps): ReactNode => {
  const { model } = useSettingsForm();
  const { children } = props;

  if (!props.name || !children)
    return null;

  const { _mode: mode = "value" } = getPropertySettingsFromData(model, props.name.toString());

  const formProps: FormItemProps = {
    name: getFieldNameFromExpression(props.name),
    label: props.label,
    style: props.style,
    required: props.required,
    tooltip: props.tooltip,
    hidden: props.hidden,
    ...(props.valuePropName ? { valuePropName: props.valuePropName } : {}),
  };

  if (typeof children === 'function') {
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
        <SettingsControl propertyName={props.name} mode={mode} lazy={props.jsSetting === 'lazy'} availableConstantsExpression={props.availableConstantsExpression}>
          {(value, onChange, propertyName) => children(value, onChange, propertyName)}
        </SettingsControl>
      </Form.Item>
    );
  }

  if (!props.jsSetting) {
    return <Form.Item {...formProps}>{children}</Form.Item>;
  }

  const valuePropName = props.valuePropName ?? 'value';
  const childrenProps = typeof (children.props) === "object" && isDefined(children.props)
    ? children.props
    : {};
  const readOnly = props.readOnly ??
    (typeof (childrenProps) === "object" && isDefined(childrenProps)
      ? getBooleanPropertyOrUndefined(childrenProps, "readOnly") ?? getBooleanPropertyOrUndefined(childrenProps, "disabled")
      : false) ?? false;

  return (
    <ConfigurableFormItem<Value | IPropertySetting<Value>>
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
          <SettingsControl<Value>
            propertyName={props.name}
            mode="value"
            onChange={onChange}
            value={value ?? undefined}
            readOnly={readOnly}
            lazy={props.jsSetting === 'lazy'}
            availableConstantsExpression={props.availableConstantsExpression}
          >
            {(value, onChange) => {
              const wrappedChildProps: WrappedComponentProps = {
                ...childrenProps,
                readOnly: readOnly,
                disabled: readOnly,

                onChange: (event) => {
                  const data = isChangeEvent(event) && typeof (event.target) === "object" && valuePropName in event.target
                    ? event.target[valuePropName as keyof typeof event.target]
                    : event;
                  onChange(data as Value);
                },
                [valuePropName]: value,
              };
              return cloneElement(
                children,
                wrappedChildProps);
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

  const { propertyFilter } = useSettingsForm();
  return !Boolean(propertyFilter) || (typeof propertyFilter === 'function' && propertyFilter(props.name.toString()))
    ? <SettingsFormComponent {...props} />
    : null;
};

export default SettingsFormItem;
