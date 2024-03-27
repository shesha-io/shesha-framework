import React, { FC, ReactNode, useMemo } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ColProps, Form, FormItemProps } from 'antd';
import { useForm } from '@/providers/form';
import { getFieldNameFromExpression, getValidationRules, isCommonContext } from '@/providers/form/utils';
import classNames from 'classnames';
import { useFormItem } from '@/providers';
import { DataBinder } from '@/hocs/dataBinder';
import { useDataContextManager } from '@/providers/dataContextManager';

export type IConfigurableFormItemChildFunc = (value: any, onChange: (...args: any[]) => void, propertyName?: string, getFieldValue?: (propertyName: string) => object[]) => ReactNode;

export interface IConfigurableFormItemProps {
  model: IConfigurableFormComponent;
  readonly children?: ReactNode | IConfigurableFormItemChildFunc;
  className?: string;
  valuePropName?: string;
  initialValue?: any;
  customVisibility?: string;
  wrapperCol?: ColProps;
  labelCol?: ColProps;
}

const ConfigurableFormItem: FC<IConfigurableFormItemProps> = ({
  children,
  model,
  valuePropName,
  initialValue,
  className,
  labelCol,
  wrapperCol,
}) => {

  const { formData, form } = useForm();

  const formItem = useFormItem();

  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol]);

  const propName = namePrefix && (!model.context || !isCommonContext(model.context))
    ? namePrefix + '.' + model.propertyName 
    : model.propertyName;

  const { hideLabel } = model;

  const formItemProps: FormItemProps = {
    className: classNames(className),//, { 'form-item-hidden': hideLabel }),
    label: hideLabel ? null : model.label,
    labelAlign: model.labelAlign,
    hidden: model.hidden,
    valuePropName: valuePropName,
    initialValue: initialValue,
    tooltip: model.description,
    rules: model.hidden ? [] : getValidationRules(model, { formData }),
    labelCol: layout?.labelCol,
    wrapperCol: hideLabel ? { span: 24 } : layout?.wrapperCol
  };

  const { getDataContext } = useDataContextManager();
  const context =  getDataContext(model.context);
  const { getFieldValue } = context ?? {};

  const reactChildren = children as ReactNode;
  const funcChildren = children as IConfigurableFormItemChildFunc;

    // binding to context data for upgraded components 
  if (!!context && typeof funcChildren === 'function') {
    
    const value = getFieldValue(propName);

    return (
      <Form.Item {...formItemProps}>
        <DataBinder 
          onChange={(val) => {
            const value = !!val?.target ? val?.target[!!valuePropName ? valuePropName : 'value'] : val;
            if (!!context?.setFieldValue)
              context.setFieldValue(propName, value);
          }}
          value={value}
          getFieldValue={(propName) => getDataContext(model.context)?.getFieldValue(propName)}
        >
          {funcChildren}
        </DataBinder>
      </Form.Item>
    );
  }

  formItemProps.name = getFieldNameFromExpression(propName);

  // binding to from data for upgraded components
  if (typeof funcChildren === 'function') 
    return (
      <Form.Item {...formItemProps}>
        <DataBinder valuePropName={valuePropName} propertyName={model.propertyName} getFieldValue={(propName) => form?.getFieldValue(propName)}>
          {funcChildren}
        </DataBinder>
      </Form.Item>
    );

  // Use standard Form.Item for components without binding support
  return (
    <Form.Item {...formItemProps}>{reactChildren}</Form.Item>
  );
};

export default ConfigurableFormItem;
