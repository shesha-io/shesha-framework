import React, { CSSProperties, FC } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { FilledIconTypes } from '../iconPicker/iconNamesFilled';
import { OutlinedIconTypes } from '../iconPicker/iconNamesOutlined';
import { TwoToneIconTypes } from '../iconPicker/iconNamesTwoTone';
import { useThemeState } from '@/providers';
import * as antdIcons from '@ant-design/icons';

export type IconType = FilledIconTypes | OutlinedIconTypes | TwoToneIconTypes;

export interface IShaIconProps extends IconBaseProps {
  iconName: IconType;
  twoToneColor?: string;
  style?: CSSProperties;
}

const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', ...props }) => {
  const { theme } = useThemeState();

  if (!antdIcons[iconName]) {
    return null;
  }

  const IconComponent = antdIcons[iconName];

  props.twoToneColor = theme?.application?.primaryColor || '#1890ff';

  return <IconComponent {...props} />;
};

export default ShaIcon;
