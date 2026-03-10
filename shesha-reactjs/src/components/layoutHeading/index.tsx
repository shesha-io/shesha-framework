import classNames from 'classnames';
import React, { CSSProperties, FC, ReactNode } from 'react';
import { useStyles } from './styles/styles';

export interface ILayoutHeadingProps {
  extra?: ReactNode | (() => ReactNode);
  title?: string;
  style?: CSSProperties;
  className?: string;
}

export const LayoutHeading: FC<ILayoutHeadingProps> = ({ title, extra, style, className }) => {
  const { styles } = useStyles();

  return (
    <div className={classNames(styles.shaLayoutHeadingContent, className)} style={style}>
      <h2 className={styles.shaLayoutHeadingTitle}>{title}</h2>

      <div>{typeof extra === 'function' ? extra() : extra}</div>
    </div>
  );
};

export default LayoutHeading;
