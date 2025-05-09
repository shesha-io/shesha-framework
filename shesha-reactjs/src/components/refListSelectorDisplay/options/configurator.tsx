import { Alert } from 'antd';
import React, { FC, ReactNode } from 'react';
import { useStyles } from '@/components/refListSelectorDisplay/options/styles/styles';
import { useRefListItemGroupConfigurator } from '@/components/refListSelectorDisplay/provider';
import RefListItemProperties from '@/components/refListSelectorDisplay/options/properties';

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
        message={readOnly ? 'Here you can view your component configurations.' : 'Here you can configure the component step configurations.'}
        className={styles.shaToolbarConfiguratorAlert}
      />
      <RefListItemProperties />
    </div>
  );
};

export default RefListItemGroupConfigurator;
