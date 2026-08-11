import { Form, FormProps } from 'antd';
import { FC, Fragment, PropsWithChildren } from 'react';

interface IProps {
  readonly formProps?: FormProps | undefined;
}

export const PasswordComboWrapper: FC<PropsWithChildren<IProps>> = ({ children, formProps }) => {
  if (Object.getOwnPropertyNames(formProps || {}).length) {
    return <Form {...formProps}>{children}</Form>;
  }

  return <Fragment>{children}</Fragment>;
};

export default PasswordComboWrapper;
