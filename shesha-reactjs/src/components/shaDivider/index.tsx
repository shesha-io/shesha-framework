import React from 'react';
import { Divider } from 'antd';
import { DividerProps } from 'antd/lib/divider';
import classNames from 'classnames';

export const ShaDivider: React.FC<DividerProps> = ({ className, ...props }) => (
  <Divider className={classNames('sha-divider', className)} {...props} />
);

export default ShaDivider;
