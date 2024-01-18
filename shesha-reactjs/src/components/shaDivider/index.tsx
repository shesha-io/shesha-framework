import React from 'react';
import { Divider } from 'antd';
import { DividerProps } from 'antd/lib/divider';
import classNames from 'classnames';
import { css, cx } from 'antd-style';

export const ShaDivider: React.FC<DividerProps> = ({ className, ...props }) => {
  const shaDivider = cx("sha-divider", css`
    margin: 12px;
  `);
  return (
    <Divider className={classNames(shaDivider, className)} {...props} />
  );
};

export default ShaDivider;
