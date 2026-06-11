import React, { cloneElement, ReactNode, SyntheticEvent } from 'react';
import { Form, FormItemProps } from 'antd';
import { getFieldNameFromExpression } from '@/providers/form/utils';
import { getPropertySettingsFromData } from '@/designer-components/_settings/utils/utils';
import { IConfigurableFormItemProps } from './model';
import { ConfigurableFormItemLive } from './configurableFormItemLive';
import { useStyles } from './styles';
import classNames from 'classnames';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import SettingsControl, { SettingsControlChildrenFunc } from '@/designer-components/_settings/settingsControl';
import { IPropertySetting, UnwrapCodeEvaluators } from '@/providers';
import { IAnyObject } from '@/interfaces';
import { isNullOrWhiteSpace } from '@/utils/nullables';

export const ConfigurableFormItemSetting = <TValue = unknown>({
  children,
  model,
  valuePropName,
  autoAlignLabel = true,
  lazy,
  availableConstantsExpression,
}: UnwrapCodeEvaluators<IConfigurableFormItemProps<TValue>>): ReactNode => {
  const { formData } = useShaFormInstance();
  const { styles } = useStyles({ autoAlignLabel });
  if (model.hidden) return null;

  const { _mode: mode = "value" } = getPropertySettingsFromData(formData, model.propertyName ?? "");

  const formProps: FormItemProps = {
    name: getFieldNameFromExpression(model.propertyName),
    label: model.label,
    required: model.validate?.required,
    tooltip: model.description || undefined,
    hidden: model.hidden,
  };

  if (typeof children === 'function') {
    const childrenFunc = children as SettingsControlChildrenFunc;
    return (
      <Form.Item {...formProps}>
        <SettingsControl propertyName={model.propertyName ?? ""} mode={mode} lazy={lazy} availableConstantsExpression={availableConstantsExpression}>
          {(value, onChange, propertyName) => childrenFunc(value, onChange, propertyName)}
        </SettingsControl>
      </Form.Item>
    );
  }

  const childrenElement = children as React.ReactElement<{ readOnly: boolean | undefined; disabled: boolean | undefined } & IAnyObject>;
  const readOnly = model.readOnly || childrenElement.props.readOnly || childrenElement.props.disabled;

  return (
    <ConfigurableFormItemLive<IPropertySetting<TValue> | TValue>
      model={{
        propertyName: model.propertyName,
        label: model.label,
        type: '',
        id: '',
        description: model.description,
        validate: { required: model.validate?.required },
        hidden: model.hidden,
      }}
      className={classNames(styles.settingsFormItem, "sha-js-label")}
      labelCol={{ span: 24 }}
      wrapperCol={{ span: 24 }}
      autoAlignLabel={autoAlignLabel}
    >
      {(value, onChange) => {
        return (
          <SettingsControl<TValue>
            propertyName={model.propertyName ?? ""}
            mode="value"
            onChange={onChange}
            value={value}
            readOnly={readOnly}
            lazy={lazy}
            availableConstantsExpression={availableConstantsExpression}
          >
            {(value, onChange) => {
              return cloneElement(
                childrenElement,
                {
                  ...childrenElement.props,
                  readOnly: readOnly,
                  disabled: readOnly,
                  onChange: (event: SyntheticEvent) => {
                    const { target } = event;
                    const data = !isNullOrWhiteSpace(valuePropName) && typeof target === 'object' && valuePropName in target
                      ? target[valuePropName as keyof typeof target]
                      : event;
                    onChange(data as TValue);
                  },
                  ...(valuePropName ? { [valuePropName]: value } : {}),
                });
            }}
          </SettingsControl>
        );
      }}
    </ConfigurableFormItemLive>
  );
};
