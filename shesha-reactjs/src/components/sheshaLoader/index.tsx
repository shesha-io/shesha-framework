import { Flex } from 'antd';
import React, { FC } from 'react';

interface ISheshaLoader {
  message?: string;
}

const SheshaLoader: FC<ISheshaLoader> = ({ message = 'Initializing...' }) => (
  <Flex vertical style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <img src={`/images/SheshaLoadingAnimation.gif`} alt="Shesha Loading Animation" />
    <div>{message}</div>
  </Flex>
);

export default SheshaLoader;
