import { Tag } from 'antd';
import React, { FC, PropsWithChildren } from 'react';

interface ITagProps {
  color: string;
  icon?: React.ReactNode;
  style: React.CSSProperties;
}

const RefTag: FC<PropsWithChildren<ITagProps>> = ({ children, color, icon, style }) => {
  if (!children) return null;

  return (
    <Tag className="sha-status-tag" color={color} style={style} icon={icon}>
      {children}
    </Tag>
  );
};

export default RefTag;
