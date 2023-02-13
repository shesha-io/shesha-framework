import React, { FC } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { FilledIconTypes } from '../iconPicker/iconNamesFilled';
import { OutlinedIconTypes } from '../iconPicker/iconNamesOutlined';
import { TwoToneIconTypes } from '../iconPicker/iconNamesTwoTone';

export type IconType = FilledIconTypes | OutlinedIconTypes | TwoToneIconTypes;

export interface IShaIconProps extends IconBaseProps {
  iconName: IconType;
  twoToneColor?: string;
}

const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', ...props }) => {
  const icons = require('@ant-design/icons');

  if (!icons[iconName]) {
    console.log('icon not found:');
    console.log(iconName);
    return null;
  }

  const IconComponent = icons[iconName];

  return <IconComponent {...props} />;
};

export default ShaIcon;
