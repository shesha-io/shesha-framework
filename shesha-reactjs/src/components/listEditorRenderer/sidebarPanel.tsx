import React, { FC } from 'react';
import classNames from 'classnames';
import { useStyles } from './styles/styles';
import { ISidebarProps } from './models';

export const SidebarPanel: FC<ISidebarProps> = (props) => {
  const { styles } = useStyles();
  const { title, content, className } = props;

  return (
    <div className={classNames(styles.propsPanelContent, className)}>
      <div className={styles.propsPanelHeader}>
        <div className={styles.propsPanelTitle}>{title}</div>
      </div>
      <div className={styles.propsPanelBody}>
        <div className={classNames(styles.propsPanelBodyContent)}>
          {typeof content === 'function' ? content() : content}
        </div>
      </div>
    </div>
  );
};
