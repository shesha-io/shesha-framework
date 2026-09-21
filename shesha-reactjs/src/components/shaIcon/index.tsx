import { CSSProperties, FC, Suspense } from 'react';
import classNames from 'classnames';
import { IconBaseProps } from '@ant-design/icons/lib/components/Icon';
import { useThemeState } from '@/providers';
import * as AntdIcons from '@ant-design/icons';
import { isDefined } from '@/utils/nullables';
import { getReactIconComponent, parseReactIconValue } from './reactIconFamilies';

export type IconType = keyof typeof AntdIcons;

export interface IShaIconProps extends IconBaseProps {
  iconName: IconType | string;
  twoToneColor?: string | undefined;
  style?: CSSProperties | undefined;
}

// Sized like a real glyph (1em square) so Suspense's brief loading window doesn't reflow surrounding inline content.
const ReactIconFallback: FC<{ style?: CSSProperties | undefined; className?: string | undefined }> = ({ style, className }) => (
  <span aria-hidden className={className} style={{ display: 'inline-block', width: '1em', height: '1em', ...style }} />
);

export const ShaIcon: FC<IShaIconProps> = ({ iconName = 'WarningFilled', style, className, twoToneColor, ...rest }) => {
  const { theme, iconPrefixCls } = useThemeState();

  if (!isDefined(iconName)) return undefined;

  const reactIcon = parseReactIconValue(iconName);
  if (reactIcon) {
    // React.lazy isn't supported by classic (non-streaming) SSR - render the same fallback directly instead.
    if (typeof window === 'undefined') return <ReactIconFallback style={style} className={className} />;

    const LazyIcon = getReactIconComponent(reactIcon.family, reactIcon.exportName);
    return (
      <Suspense fallback={<ReactIconFallback style={style} className={className} />}>
        <LazyIcon style={style} className={classNames(iconPrefixCls, className)} />
      </Suspense>
    );
  }

  const IconComponent = AntdIcons[iconName as IconType] as FC<IconBaseProps & { twoToneColor?: string }> | undefined;
  if (!IconComponent)
    return undefined;

  // Two-tone icons need a secondary colour; honour an explicitly supplied one and fall back to the theme.
  const resolvedTwoToneColor = twoToneColor ?? (theme.application?.primaryColor || '#1890ff');

  return <IconComponent style={style} className={className} twoToneColor={resolvedTwoToneColor} {...rest} />;
};

export { REACT_ICON_FAMILIES, loadFamilyModule, parseReactIconValue, buildReactIconValue } from './reactIconFamilies';
export type { IReactIconFamily, FamilyModule, ReactIconComponent } from './reactIconFamilies';
