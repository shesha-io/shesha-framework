import React, { FC } from 'react';
import { Result, Typography } from 'antd';

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
        </>
      )}
    />
  );
};
