import React, { CSSProperties, FC } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { useThemeState } from '@/providers';
import * as AntdIcons from '@ant-design/icons';
import { isDefined } from '@/utils/nullables';

export type IconType = keyof typeof AntdIcons;

export interface IShaIconProps extends IconBaseProps {
  iconName: IconType | string;
  twoToneColor?: string | undefined;
  style?: CSSProperties | undefined;
}

export const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', ...props }) => {
  const { theme } = useThemeState();

  const IconComponent = isDefined(iconName) ? AntdIcons[iconName as IconType] as FC<IconBaseProps> : undefined;
  if (!IconComponent)
    return undefined;

  props.twoToneColor = theme.application?.primaryColor || '#1890ff';

  return <IconComponent />;
};
