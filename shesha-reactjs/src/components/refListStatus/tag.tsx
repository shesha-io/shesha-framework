import { Tag } from 'antd';
import React, { FC, PropsWithChildren } from 'react';
import { useStyles } from './styles/styles';

interface ITagProps {
  color: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

const RefTag: FC<PropsWithChildren<ITagProps>> = ({ children, ...props }) => {
  const { styles } = useStyles();
  if (!children && !props?.icon) return null;

  return (
    <Tag className={styles.shaStatusTag} {...props} >
      {children}
    </Tag>
  );
};

export default RefTag;