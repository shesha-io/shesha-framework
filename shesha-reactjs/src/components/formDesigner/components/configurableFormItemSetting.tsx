import React, { FC, cloneElement } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression } from '@/providers/form/utils';
import { getPropertySettingsFromData } from '@/designer-components/_settings/utils';
import { SettingsControl, useShaFormInstance } from '@/index';
import { IConfigurableFormItemChildFunc, IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemLive } from './configurableFormItemLive';

export const ConfigurableFormItemSetting: FC<IConfigurableFormItemProps> = ({
  children,
  model,
  valuePropName,
}) => {
  const { formData } = useShaFormInstance();

  if (model.hidden) return null;

  const { _mode: mode } = getPropertySettingsFromData(formData, model.propertyName);

  const formProps: FormItemProps = {
    name: getFieldNameFromExpression(model.propertyName),
    label: model.label,
    //style: model.style,
    required: model.validate?.required,
    tooltip: model.description,
    hidden: model.hidden,
  };

  if (typeof children === 'function') {
    const childrenFunc = children as IConfigurableFormItemChildFunc;
    return (
      <Form.Item {...formProps}>
        <SettingsControl propertyName={model.propertyName} mode={mode}>
          {(value, onChange, propertyName) => childrenFunc(value, onChange, propertyName)}
        </SettingsControl>
      </Form.Item>
    );
  }

  const childrenElement = children as React.ReactElement<any>;
  const readOnly = model.readOnly || childrenElement.props.readOnly || childrenElement.props.disabled;

  return (
    <ConfigurableFormItemLive
      model={{
        propertyName: model.propertyName,
        label: model.label,
        type: '',
        id: '',
        description: model.description,
        validate: { required: model.validate?.required },
        hidden: model.hidden
      }}
      className='sha-js-label'
      labelCol={{ span: 24 }} wrapperCol={{ span: 24 }}
    >
      {(value, onChange) => {
        return (
          <SettingsControl
            propertyName={model.propertyName}
            mode={'value'}
            onChange={onChange}
            value={value}
            readOnly={readOnly}
          >
            {(value, onChange) => {
              return cloneElement(
                childrenElement,
                {
                  ...childrenElement?.props,
                  readOnly: readOnly,
                  disabled: readOnly,
                  onChange: (...args: any[]) => {
                    const event = args[0];
                    const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
                      ? (event.target as HTMLInputElement)[valuePropName]
                      : event;
                    onChange(data);
                  },
                  [valuePropName]: value
              });
            }}
          </SettingsControl>
        );
      }}
    </ConfigurableFormItemLive>
  );
};