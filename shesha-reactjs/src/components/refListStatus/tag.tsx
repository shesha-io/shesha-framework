import { Tag } from 'antd';
import { FC, PropsWithChildren } from 'react';
import * as React from 'react';
interface ITagProps {
  color?: string;
  /** antd tag variant. `solid` paints the background in `color` instead of a lightened tint. */
  variant?: 'filled' | 'solid' | 'outlined';
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

const RefTag: FC<PropsWithChildren<ITagProps>> = ({ children, ...props }) => {
  if (!children && !props.icon) return null;

  return (
    <Tag
      {...(props.className ? { className: props.className } : {})}
      {...props}
    >
      {children}
    </Tag>
  );
};

export default RefTag;
