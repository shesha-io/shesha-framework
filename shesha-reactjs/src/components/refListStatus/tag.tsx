import { Tag } from 'antd';
import React, { FC, PropsWithChildren } from 'react';
interface ITagProps {
  color: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  styles?: any;
}

const RefTag: FC<PropsWithChildren<ITagProps>> = ({ children, ...props }) => {

  if (!children && !props?.icon) return null;

  return (
    <Tag className={props.styles.shaStatusTag} {...props} >
      {children}
    </Tag>
  );
};

export default RefTag;