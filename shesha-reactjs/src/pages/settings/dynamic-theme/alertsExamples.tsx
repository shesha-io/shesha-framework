import { Alert, Space } from 'antd';
import React, { FC } from 'react';

const AlertsExample: FC = () => (
  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
    <Alert message="Success alert" type="success" showIcon />
    <Alert message="Info alert" type="info" showIcon />
    <Alert message="Warning alert" type="warning" showIcon />
    <Alert message="Error alert" type="error" showIcon />
  </Space>
);

export default AlertsExample;
