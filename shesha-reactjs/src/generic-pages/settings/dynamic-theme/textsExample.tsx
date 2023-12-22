import { Space, Typography } from 'antd';
import React, { FC } from 'react';
import { GenericText } from '@/components/formDesigner/components/text/typography';

const TextsExample: FC = () => {
  return (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <GenericText textType={'span'} propertyName="">Default text</GenericText>

      <GenericText textType={'span'} contentType="secondary" propertyName="">
        Secondary text
      </GenericText>

      <Typography.Link>Link text</Typography.Link>
    </Space>
  );
};

export default TextsExample;
