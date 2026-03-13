import React, { FC } from 'react';
import { IValuable } from '@/interfaces';
import { Progress, ProgressProps } from 'antd';

export const ProgressWrapper: FC<IValuable<number> & ProgressProps> = ({ percent, value, ...props }) => {
  return <Progress {...props} percent={percent || value} />;
};
