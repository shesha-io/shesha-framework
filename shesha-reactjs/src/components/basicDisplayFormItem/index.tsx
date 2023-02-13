import React, { FC } from 'react';
import FormItem, { FormItemProps } from 'antd/lib/form/FormItem';

export interface IBasicDisplayFormItemProps extends FormItemProps {
  notProvidedText?: string;
}

export const BasicDisplayFormItem: FC<IBasicDisplayFormItemProps> = ({ children, notProvidedText = '', ...rest }) => {
  return (
    <FormItem className="display-form-item" {...rest}>
      {children || notProvidedText}
    </FormItem>
  );
};

export default BasicDisplayFormItem;
