import { Alert } from 'antd';
import React, { FC, ReactNode } from 'react';
import LayerProperties from './properties';
import { useStyles } from './styles/styles';
import { useLayerGroupConfigurator } from '@/providers/layersProvider';
import { FormMarkup } from '@/providers/form/models';

export interface ILayerGroupConfiguratorProps {
  allowAddLayers?: boolean;
  render?: ReactNode | (() => ReactNode);
  heading?: ReactNode | (() => ReactNode);
  settings: FormMarkup;
}

export const LayerGroupConfigurator: FC<ILayerGroupConfiguratorProps> = ({ settings }) => {
  const { styles } = useStyles();
  const { readOnly } = useLayerGroupConfigurator();

  return (
    <div className={styles.shaToolbarConfigurator}>
      <Alert
        message={readOnly ? 'Here you can view layer configuration.' : 'Here you can configure the layer settings'}
        className={styles.shaToolbarConfiguratorAlert}
      />
      <LayerProperties settings={settings} />
    </div>
  );
};

export default LayerGroupConfigurator;
