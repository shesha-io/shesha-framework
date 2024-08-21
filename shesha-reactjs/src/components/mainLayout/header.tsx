import React, { FC } from 'react';
import classNames from 'classnames';
import { ConfigurableForm } from '@/components';
import { useStyles } from './styles/styles';
import { HEADER_CONFIGURATION } from './constant';
import { useAppConfigurator } from '@/index';

interface ILayoutHeaderProps {
  collapsed?: boolean;
}

const LayoutHeader: FC<ILayoutHeaderProps> = ({ collapsed }) => {
  const { styles } = useStyles();
  const { formInfoBlockVisible } = useAppConfigurator();

  return (
    <div className={classNames(styles.layoutHeader, { collapsed })} style={{height: formInfoBlockVisible ? "110%" : "55px"}}>
      <div className={styles.headerWrapper}>
        <ConfigurableForm
          mode={'readonly'}
          formId={{ name: HEADER_CONFIGURATION.name, module: HEADER_CONFIGURATION.module }}
          showFormInfoOverlay={false}
          showDataLoadingIndicator={false}
          showMarkupLoadingIndicator={false}
        />
      </div>
    </div>
  );
};

export default LayoutHeader;
