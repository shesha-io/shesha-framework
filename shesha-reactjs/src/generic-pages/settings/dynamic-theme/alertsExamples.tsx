import { Alert, Space } from 'antd';
import React, { FC } from 'react';

const AlertsExample: FC = () => (
  <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
    <Alert title="Success alert" type="success" showIcon />
    <Alert title="Info alert" type="info" showIcon />
    <Alert title="Warning alert" type="warning" showIcon />
    <Alert title="Error alert" type="error" showIcon />
  </Space>
);

export default AlertsExample;
