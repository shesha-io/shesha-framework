import React, { FC, ReactNode, useMemo } from 'react';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ColProps, Form, FormItemProps } from 'antd';
import { useForm } from '@/providers/form';
import { getFieldNameFromExpression, getValidationRules } from '@/providers/form/utils';
import classNames from 'classnames';
import { useFormItem } from '@/providers';
import { DataBinder } from '@/hocs/dataBinder';
import { useDataContextManagerActions } from '@/providers/dataContextManager';

export type IConfigurableFormItemChildFunc = (
  value: any,
  onChange: (...args: any[]) => void,
  propertyName?: string
) => ReactNode;


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

export interface IConfigurableFormItem_FormProps {
  formItemProps: FormItemProps;
  readonly children?: IConfigurableFormItemChildFunc;
  valuePropName?: string;
}
const ConfigurableFormItemForm: FC<IConfigurableFormItem_FormProps> = (props) => {
  const {
    formItemProps,
    children,
    valuePropName,
  } = props;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder valuePropName={valuePropName}>
        {children}
      </DataBinder>
    </Form.Item>
  );
};

interface IConfigurableFormItem_ContextProps {
  formItemProps: FormItemProps;

  valuePropName?: string;
  propertyName: string;
  contextName: string;
  readonly children?: IConfigurableFormItemChildFunc;
}

const ConfigurableFormItemContext: FC<IConfigurableFormItem_ContextProps> = (props) => {
  const {
    formItemProps,
    valuePropName,
    propertyName,
    contextName,
    children
  } = props;

  const { getDataContext } = useDataContextManagerActions();
  const context = getDataContext(contextName);
  const { getFieldValue } = context ?? {};

  const value = getFieldValue ? getFieldValue(propertyName) : undefined;

  return (
    <Form.Item {...formItemProps}>
      <DataBinder
        onChange={(val) => {
          const value = !!val?.target ? val?.target[!!valuePropName ? valuePropName : 'value'] : val;
          if (!!context?.setFieldValue)
            context.setFieldValue(propertyName, value);
        }}
        value={value}
      >
        {children}
      </DataBinder>
    </Form.Item>
  );
};

const ConfigurableFormItem: FC<IConfigurableFormItemProps> = ({
  children,
  model,
  valuePropName,
  initialValue,
  className,
  labelCol,
  wrapperCol,
}) => {
  const { formData } = useForm();

  const formItem = useFormItem();

  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItemlabelCol, formItemWrapperCol]);

  const propName = namePrefix && !model.initialContext
    ? namePrefix + '.' + model.propertyName
    : model.propertyName;

  const { hideLabel } = model;

  const formItemProps: FormItemProps = {
    className: classNames(className),
    label: hideLabel ? null : model.label,
    labelAlign: model.labelAlign,
    hidden: model.hidden,
    valuePropName: valuePropName,
    initialValue: initialValue,
    tooltip: model.description,
    rules: model.hidden ? [] : getValidationRules(model, { formData }),
    labelCol: layout?.labelCol,
    wrapperCol: hideLabel ? { span: 24 } : layout?.wrapperCol,
    name: model.context ? undefined : getFieldNameFromExpression(propName),
  };

  if (typeof children === 'function') {
    if (model.context) {
      return (
        <ConfigurableFormItemContext
          formItemProps={formItemProps}
          valuePropName={valuePropName}
          propertyName={propName}
          contextName={model.context}
        >
          {children}
        </ConfigurableFormItemContext>
      );
    } else {
      return (
        <ConfigurableFormItemForm
          formItemProps={formItemProps}
          valuePropName={valuePropName}
        >
          {children}
        </ConfigurableFormItemForm>
      );
    }
  } else {
    // Use standard Form.Item for components without binding support
    return (
      <Form.Item {...formItemProps}>{children}</Form.Item>
    );
  }
};

export default React.memo(ConfigurableFormItem);