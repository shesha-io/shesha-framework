import React, { FC } from 'react';
import classNames from 'classnames';
import { ConfigurableForm } from '@/components';
import { useStyles } from './styles/styles';
import { HEADER_CONFIGURATION } from './constant';
import { IPersistedFormProps, useAppConfigurator } from '@/index';

interface ILayoutHeaderProps {
  collapsed?: boolean;
  headerFormId?: IPersistedFormProps;
}

const LayoutHeader: FC<ILayoutHeaderProps> = ({ collapsed, headerFormId }) => {
  const { styles } = useStyles();
  const { formInfoBlockVisible } = useAppConfigurator();

  const localHeaderFormId = headerFormId ?? HEADER_CONFIGURATION;
  return (
    <div
      className={classNames(styles.layoutHeader, { collapsed })}
      style={{ height: formInfoBlockVisible ? '110%' : '55px' }}
    >
      <div className={styles.headerWrapper}>
        <ConfigurableForm
          mode={'readonly'}
          formId={{ name: localHeaderFormId.name, module: localHeaderFormId.module }}
          showFormInfoOverlay={false}
          showDataLoadingIndicator={false}
          showMarkupLoadingIndicator={false}
        />
      </div>
    </div>
  );
};

export default LayoutHeader;
