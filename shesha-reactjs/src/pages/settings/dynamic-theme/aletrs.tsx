import { Alert, Form, Space } from 'antd';
import React, { FC } from 'react';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 6,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 14,
    },
  },
};

const AlertsExample: FC = () => (
  <Form {...formItemLayout}>
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Alert message="Success alert" type="success" showIcon />
      <Alert message="Info alert" type="info" showIcon />
      <Alert message="Warning alert" type="warning" showIcon />
      <Alert message="Error alert" type="error" showIcon />
    </Space>
  </Form>
);

export default AlertsExample;
