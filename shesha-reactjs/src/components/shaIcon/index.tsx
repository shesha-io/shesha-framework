import React, { CSSProperties, FC } from 'react';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { useThemeState } from '@/providers';
import * as AntdIcons from '@ant-design/icons';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export type IconType = keyof typeof AntdIcons;

export interface IShaIconProps extends IconBaseProps {
  iconName: IconType | string;
  twoToneColor?: string | undefined;
  style?: CSSProperties | undefined;
}

export const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', style, className, twoToneColor }) => {
  const { theme } = useThemeState();

  const IconComponent = isDefined(iconName) ? AntdIcons[iconName as IconType] as FC<IconBaseProps & { twoToneColor?: string }> : undefined;
  if (!IconComponent)
    return undefined;

  const primaryColor = theme.application?.primaryColor;
  const resolvedTwoToneColor = isDefined(twoToneColor)
    ? twoToneColor
    : isNullOrWhiteSpace(primaryColor) ? '#1890ff' : primaryColor;

  return <IconComponent style={style} className={className} twoToneColor={resolvedTwoToneColor} />;
};
