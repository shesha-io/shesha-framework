import React, { FC, useMemo } from 'react';
import { IConfigurableFormComponent } from '../../../providers/form/models';
import { ColProps, Form } from 'antd';
import { useForm } from '../../../providers/form';
import { getFieldNameFromExpression, getValidationRules } from '../../../providers/form/utils';
import classNames from 'classnames';
import './styles.less';
import { useFormItem } from '../../../providers';

export interface IConfigurableFormItemProps {
  model: IConfigurableFormComponent;
  readonly children?: React.ReactNode;
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

  const { namePrefix, wrapperCol: _wrapperCol, labelCol: _labelCol } = formItem;

  const isHidden = isComponentHidden(model);

  const layout = useMemo(() => {
    // Make sure the `wrapperCol` and `labelCol` from `FormItemProver` override the ones from the main form
    return { labelCol: _labelCol || labelCol, wrapperCol: _wrapperCol || wrapperCol };
  }, [formItem]);

  const getPropName = () => {
    const name = getFieldNameFromExpression(model.name);

    if (namePrefix) {
      const prefix = namePrefix?.split('.');

      return typeof name === 'string' ? [...prefix, name] : [...prefix, ...name];
    }

    return name;
  };

  const { hideLabel } = model;

  return (
    <Form.Item
      className={classNames(className, { 'form-item-hidden': hideLabel })}
      name={getPropName()}
      // name={getFieldNameFromExpression(model.name)}
      label={hideLabel ? null : model.label}
      labelAlign={model.labelAlign}
      hidden={isHidden}
      valuePropName={valuePropName}
      initialValue={initialValue}
      tooltip={model.description}
      rules={isHidden ? [] : getValidationRules(model, { formData })}
      labelCol={layout?.labelCol}
      wrapperCol={hideLabel ? { span: 24 } : layout?.wrapperCol}
    >
      {children}
    </Form.Item>
  );
};

export default ConfigurableFormItem;
