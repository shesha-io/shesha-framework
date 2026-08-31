import { Tag } from 'antd';
import { FC, PropsWithChildren } from 'react';
import * as React from 'react';
import { isDefined } from '@/utils/nullables';

/**
 * A tag carrying neither text nor an icon has nothing to give it width, so it collapses to its
 * horizontal padding - and disappears entirely once that padding is zero. This keeps the colour
 * swatch visible whatever the configured padding is; an explicit `minWidth` still wins.
 */
const EMPTY_TAG_MIN_WIDTH = 24;

/**
 * `aria-label` comes in through `AriaAttributes` rather than being declared inline: it is the tag's
 * accessible name for the case where the tag renders as a bare colour swatch, with no text for a
 * screen reader to announce.
 */
export interface ITagProps extends Pick<React.AriaAttributes, 'aria-label'> {
  color?: string;
  /** antd tag variant. `solid` paints the background in `color` instead of a lightened tint. */
  variant?: 'filled' | 'solid' | 'outlined';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const RefTag: FC<PropsWithChildren<ITagProps>> = ({ children, style, ...props }) => {
  const isEmpty = !children && !props.icon;
  const resolvedStyle = isEmpty ? { minWidth: EMPTY_TAG_MIN_WIDTH, ...style } : style;

  return (
    <Tag
      {...(props.className ? { className: props.className } : {})}
      {...props}
      {...(isDefined(resolvedStyle) ? { style: resolvedStyle } : {})}
    >
      {children}
    </Tag>
  );
};

export default RefTag;
