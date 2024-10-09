import { Alert } from 'antd';
import React, { FC, ReactNode } from 'react';
import { useStyles } from './styles/styles';
import { useRefListItemGroupConfigurator } from '../provider';
import RefListItemProperties from './properties';

export interface IRefListItemGroupConfiguratorProps {
  render?: ReactNode | (() => ReactNode);
  heading?: ReactNode | (() => ReactNode);
}

export const RefListItemGroupConfigurator: FC<IRefListItemGroupConfiguratorProps> = () => {
  const { styles } = useStyles();
  const { readOnly } = useRefListItemGroupConfigurator();

  return (
    <div className={styles.shaToolbarConfigurator}>
      <Alert
        message={readOnly ? 'Here you can view chevron step configurations.' : 'Here you can configure the chevron step configurations.'}
        className={styles.shaToolbarConfiguratorAlert}
      />
      <RefListItemProperties />
    </div>
  );
};

export default RefListItemGroupConfigurator;
