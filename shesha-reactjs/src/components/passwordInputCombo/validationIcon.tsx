import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import React, { FC } from 'react';

interface IProps {
  valid?: boolean;
}

export const ValidationIcon: FC<IProps> = ({ valid }) =>
  valid ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#eb2f96" />;

export default ValidationIcon;
