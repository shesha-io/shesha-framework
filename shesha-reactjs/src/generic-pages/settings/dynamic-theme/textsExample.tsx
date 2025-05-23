import { Space, Typography } from 'antd';
import React, { FC } from 'react';

const TextsExample: FC = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Typography.Text>
        Default text
      </Typography.Text>

      <Typography.Text type='secondary'>
        Secondary text
      </Typography.Text>

      <Typography.Link>Link text</Typography.Link>
    </Space>
  );
};

export default TextsExample;
