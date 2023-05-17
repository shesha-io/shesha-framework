import React, { FC, ReactNode } from 'react';
import { Alert } from 'antd';
import { useLayerGroupConfigurator } from 'providers/layersConfigurator';
import LayerProperties from './properties';

export interface ILayerGroupConfiguratorProps {
  allowAddLayers?: boolean;
  render?: ReactNode | (() => ReactNode);
  heading?: ReactNode | (() => ReactNode);
}

export const LayerGroupConfigurator: FC<ILayerGroupConfiguratorProps> = () => {
  const { readOnly } = useLayerGroupConfigurator();

  return (
    <div className="sha-button-group-configurator">
      <Alert
        message={
          <h4>{readOnly ? 'Here you can view layer configuration.' : 'Here you can configure the layer settings'}</h4>
        }
      />
      <LayerProperties />
    </div>
  );
};

export default LayerGroupConfigurator;
