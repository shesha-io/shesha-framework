import { Alert, Space } from 'antd';
import { FC } from 'react';
import { useStyles } from './styles/styles';

const AlertsExample: FC = () => {
  const { styles } = useStyles();

  return (
    <Space orientation="vertical" size="middle" className={styles.space}>
      <Alert title="Success alert" type="success" showIcon />
      <Alert title="Info alert" type="info" showIcon />
      <Alert title="Warning alert" type="warning" showIcon />
      <Alert title="Error alert" type="error" showIcon />
    </Space>
  );
};

export default AlertsExample;
