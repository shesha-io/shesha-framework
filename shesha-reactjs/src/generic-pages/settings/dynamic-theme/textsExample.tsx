import { Space, Typography } from 'antd';
import React, { FC } from 'react';
import { useTheme } from '@/providers';

const TextsExample: FC = () => {
  const { theme } = useTheme();
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography.Text style={{ color: theme?.text?.default }}>
        Default text
      </Typography.Text>

      <Typography.Text type='secondary' style={{ color: theme?.text?.secondary }}>
        Secondary text
      </Typography.Text>

      <Typography.Link style={{ color: theme?.text?.link }}>Link text</Typography.Link>
    </Space>
  );
};

export default TextsExample;
