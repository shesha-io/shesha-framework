import React, { FC } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { FilledIconTypes } from '../iconPicker/iconNamesFilled';
import { OutlinedIconTypes } from '../iconPicker/iconNamesOutlined';
import { TwoToneIconTypes } from '../iconPicker/iconNamesTwoTone';
import { useThemeState } from '@/providers';

export type IconType = FilledIconTypes | OutlinedIconTypes | TwoToneIconTypes;

export interface IShaIconProps extends IconBaseProps {
  iconName: IconType;
  twoToneColor?: string;
}

const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', ...props }) => {
  const icons = require('@ant-design/icons');
  const { theme } = useThemeState();

  if (!icons[iconName]) {
    return null;
  }

  const IconComponent = icons[iconName];

  props.twoToneColor = theme?.application?.primaryColor || '#1890ff';

  return <IconComponent {...props} />;
};

export default ShaIcon;
