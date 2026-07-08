import { Space, Typography } from 'antd';
import React, { FC } from 'react';
import { useTheme } from '@/providers';
import { coerceCssColor } from '@/utils/nullables';

const TextsPreview: FC = () => {
  const { theme } = useTheme();
  return (
    <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
      <Typography.Text style={{ color: coerceCssColor(theme.text?.default) }}>
        Default text
      </Typography.Text>
      <Typography.Text type="secondary" style={{ color: coerceCssColor(theme.text?.secondary) }}>
        Secondary text
      </Typography.Text>
      <Typography.Link style={{ color: coerceCssColor(theme.text?.link) }}>Link text</Typography.Link>
    </Space>
  );
};

export default TextsPreview;
