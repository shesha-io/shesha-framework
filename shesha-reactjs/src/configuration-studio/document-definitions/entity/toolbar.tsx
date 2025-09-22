import React, { FC } from 'react';
import ModelConfiguratorToolbar from '@/components/modelConfigurator/toolbar';

export interface IEntityToolbarProps {
  readOnly?: boolean;
}

export const EntityToolbar: FC<IEntityToolbarProps> = () => {
  return (
    <div>
      <ModelConfiguratorToolbar />
    </div>
  );
};
