import React, { FC } from 'react';

interface ISheshaLoader {
  message?: string;
}

const SheshaLoader: FC<ISheshaLoader> = ({ message = 'Initializing...' }) => (
  <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
    <img src="/images/SheshaLoadingAnimation.gif" alt="Shesha Loading Animation" />
    <div>{message}</div>
  </div>
);

export default SheshaLoader;
