import React, { FC, PropsWithChildren, useMemo } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export interface IShaSpin {
  spinning?: boolean;
  spinIconSize?: number;
  tip?: string;
}

export const ShaSpin: FC<PropsWithChildren<IShaSpin>> = ({ children, spinning, spinIconSize = 24, tip }) => {
  const indicator = useMemo(() => <LoadingOutlined style={{ fontSize: spinIconSize }} spin />, [spinIconSize]);
  return <Spin className="sha-spin" spinning={Boolean(spinning) || false} indicator={indicator} tip={tip}>
    {children}
  </Spin>;
};

export default ShaSpin;
