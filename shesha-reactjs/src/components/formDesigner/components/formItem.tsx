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
import { DataBinder } from 'hocs/dataBinder';

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
    const name = getFieldNameFromExpression(model.propertyName);

    if (namePrefix) {
      const prefix = namePrefix?.split('.');

      return typeof name === 'string' ? [...prefix, name] : [...prefix, ...name];
    }

    return name;
  };

  const propNameMemo = useMemo(() => {
    return getPropName();
  }, [model.propertyName, namePrefix]);

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

  const { getDataContext } = useDataContextManager();
  const context =  getDataContext(model.context);
  const { data } = context?.dataContext ?? {};

  const reactChildren = children as ReactNode;
  const funcChildren = children as (value: any, onChange:  (...args: any[]) => void) => ReactNode;

  // binding to context data for upgraded components 
  if (!!model.context) {
    
    let value = undefined;

    if (!!data) {
      if (typeof propNameMemo === 'string')
        value = data[propNameMemo];
      else if (Array.isArray(propNameMemo) && propNameMemo.length > 0) {
        value = data[propNameMemo[0]];
        propNameMemo.forEach((item, index) => {
          if (index > 0)
            value = typeof value === 'object' ? value[item] : undefined;
        });
      }
    }

    return (
      <Form.Item {...formItemProps}>
        <DataBinder 
          onChange={(val) => {
            const value = !!val.target ? val.target[!!valuePropName ? valuePropName : 'value'] : val;
            if (!!context.dataContext.onChange)
              context.dataContext.onChange(propNameMemo, value);
          }}
          value={value}
        >
          {funcChildren}
        </DataBinder>
      </Form.Item>
    );
  }

  formItemProps.name = propNameMemo;
  // name={getFieldNameFromExpression(model.name)}
  //help={''}
  //hasFeedback

  // binding to from data for upgraded components 
  if (typeof funcChildren === 'function') 
    return (
      <Form.Item {...formItemProps}>
        <DataBinder valuePropName={valuePropName}>
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
