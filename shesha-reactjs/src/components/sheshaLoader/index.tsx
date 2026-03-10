import { Flex } from 'antd';
import React, { FC } from 'react';

interface ISheshaLoader {
  message?: string;
}

const SheshaLoader: FC<ISheshaLoader> = ({ message = 'Initializing...' }) => (
  <Flex vertical justify="center" align="center" style={{ height: '100vh' }}>
    <img src="/images/SheshaLoadingAnimation.gif" alt="Shesha Loading Animation" />
    <div>{message}</div>
  </Flex>
);

export default SheshaLoader;
