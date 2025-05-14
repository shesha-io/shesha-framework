import { Flex, Typography } from 'antd';
import React, { FC } from 'react';
import Image from 'next/image';
import './styles.css';

const { Title } = Typography;

interface ISheshaLoader {
  message?: string;
}

const SheshaLoader: FC<ISheshaLoader> = ({ message = 'Initializing' }) => (
  <Flex vertical justify="center" align="center" style={{ height: '100vh' }}>
    <Image src="/images/SheshaLoadingAnimation.gif" alt="Shesha Loading Animation" width={200} height={200} />
    <Title className="loading" level={3}>
      {message}
    </Title>
  </Flex>
);

export default SheshaLoader;
