import React, { FC } from 'react';
import classNames from 'classnames';
import { ConfigurableForm } from '@/components';
import { useStyles } from './styles/styles';
import { HEADER_CONFIGURATION } from './constant';

interface ILayoutHeaderProps {
  collapsed?: boolean;
}

const LayoutHeader: FC<ILayoutHeaderProps> = ({ collapsed }) => {
  const { styles } = useStyles();

  return (
    <div className={classNames(styles.layoutHeader, { collapsed })} style={{height: "auto", width: "auto"}}>
      <div className={styles.headerWrapper}>
        <ConfigurableForm
          mode={'readonly'}
          formId={{ name: HEADER_CONFIGURATION.name, module: HEADER_CONFIGURATION.module }}
        />
      </div>
    </div>
  );
};

export default LayoutHeader;
