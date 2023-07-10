import React, { FC, ReactNode, useMemo } from 'react';
import { IConfigurableFormComponent } from '../../../providers/form/models';
import { ColProps, Form, FormItemProps } from 'antd';
import { useForm } from '../../../providers/form';
import { getFieldNameFromExpression, getValidationRules } from '../../../providers/form/utils';
import classNames from 'classnames';
import './styles.less';
import { useFormItem } from '../../../providers';
//import { BindingProvider } from 'providers/bindingProvider';
import { useDataContextManager } from 'providers/dataContextManager';
import { DataBinderEx } from 'hocs/dataBinderEx';

export interface IConfigurableFormItemProps {
  model: IConfigurableFormComponent;
  readonly children?: ReactNode | ((value: any, onChange:  (...args: any[]) => void) => ReactNode);
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
  const { isComponentHidden, formData } = useForm();

  const formItem = useFormItem();

  const { namePrefix, wrapperCol: formItemWrapperCol, labelCol: formItemlabelCol } = formItem;

  const isHidden = isComponentHidden(model);

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: formItemlabelCol || labelCol, wrapperCol: formItemWrapperCol || wrapperCol };
  }, [formItem]);

  const getPropName = () => {
    const name = getFieldNameFromExpression(model.name);

    if (namePrefix) {
      const prefix = namePrefix?.split('.');

      return typeof name === 'string' ? [...prefix, name] : [...prefix, ...name];
    }

    return name;
  };

  const propNameMemo = useMemo(() => {
    return getPropName();
  }, [model.name, namePrefix]);

  const { hideLabel } = model;

  const formItemProps: FormItemProps = {
    className: classNames(className, { 'form-item-hidden': hideLabel }),
    label: hideLabel ? null : model.label,
    labelAlign: model.labelAlign,
    hidden: isHidden,
    valuePropName: valuePropName,
    initialValue: initialValue,
    tooltip: model.description,
    rules: isHidden ? [] : getValidationRules(model, { formData }),
    labelCol: layout?.labelCol,
    wrapperCol: hideLabel ? { span: 24 } : layout?.wrapperCol
  };

  const { getDataContext, onChange } = useDataContextManager();
  const context =  getDataContext(model.context);
  const { data } = context ?? {};

  const reactChildren = children as ReactNode;
  const funcChildren = children as (value: any, onChange:  (...args: any[]) => void) => ReactNode;

  // binding to context data for upgraded components 
  if (!!model.context && model.context !== 'formData' ) {
    return (
      <Form.Item {...formItemProps}>
        <DataBinderEx 
          onChange={(val) => {
            if (!!onChange)
              onChange(model.context, propNameMemo, val.target[!!valuePropName ? valuePropName : 'value']);
          }}
          value={!!data ? data[propNameMemo?.toString()] : undefined}
        >
          {funcChildren}
        </DataBinderEx>
      </Form.Item>
    );
  }

  formItemProps.name = propNameMemo;
  // name={getFieldNameFromExpression(model.name)}
  //help={''}
  //hasFeedback

  // binding to from data for upgraded components 
  if (model.context === 'formData' && funcChildren) 
    return (
      <Form.Item {...formItemProps}>
        <DataBinderEx valuePropName={valuePropName}>
          {funcChildren}
        </DataBinderEx>
      </Form.Item>
    );

  // Use standard Form.Item for components without binding support
  return (
    <Form.Item {...formItemProps}>{reactChildren}</Form.Item>
  );
};

export default ConfigurableFormItem;
