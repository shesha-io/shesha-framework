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

export const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', style, className, twoToneColor, ...rest }) => {
  const { theme } = useThemeState();

  const IconComponent = isDefined(iconName) ? AntdIcons[iconName as IconType] as FC<IconBaseProps & { twoToneColor?: string }> : undefined;
  if (!IconComponent)
    return undefined;

  // Two-tone icons need a secondary colour; honour an explicitly supplied one and fall back to the theme.
  const resolvedTwoToneColor = twoToneColor ?? (theme.application?.primaryColor || '#1890ff');

  // Must forward style (size/colour), className, twoToneColor and the remaining props to the rendered icon.
  // These were dropped during the strict-null-checks refactor, which broke every icon's styling.
  return <IconComponent style={style} className={className} twoToneColor={resolvedTwoToneColor} {...rest} />;
};
