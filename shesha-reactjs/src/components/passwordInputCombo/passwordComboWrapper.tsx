import { Col, Form, FormProps } from 'antd';
import React, { FC, PropsWithChildren } from 'react';

interface IProps {
  readonly formProps?: FormProps;
  style?: React.CSSProperties;
}

export const PasswordComboWrapper: FC<PropsWithChildren<IProps>> = ({ children, formProps, style }) => {
  if (Object.getOwnPropertyNames(formProps || {}).length) {
    return <Form {...formProps}>{children}</Form>;
  }

  return <Col style={{...style, height: 'max-content'}}>{children}</Col>;
};

export default PasswordComboWrapper;
