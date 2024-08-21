import React, { FC } from 'react';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

interface IValidationIconProps {
  valid?: boolean;
}

export const ValidationIcon: FC<IValidationIconProps> = ({ valid }) =>
  valid ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#eb2f96" />;

export default ValidationIcon;
