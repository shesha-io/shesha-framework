import React, { FC } from 'react';
import { Button, Result, Typography } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;

export const HomePageDocument: FC = () => {
  return (
    <Result
      icon={null}
      title="Configuration Studio"
      subTitle={(
        <>
          <Paragraph>Welcome to the Shesha Configuration Studio</Paragraph>
          <Paragraph>Start to configure your application by adding configuration items on the left.</Paragraph>
          <Paragraph>Or, watch the intro video below to help you get started...</Paragraph>
        </>
      )}
      extra={<Button type="primary" size="large">Get Started <RightOutlined /></Button>}
    />
  );
};
