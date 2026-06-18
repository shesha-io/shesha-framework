import { Tag } from 'antd';
import React, { FC, PropsWithChildren } from 'react';
interface ITagProps {
  color?: string;
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
