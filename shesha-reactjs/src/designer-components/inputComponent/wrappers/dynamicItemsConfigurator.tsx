import { IDynamicItemsConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { DynamicActionsConfigurator } from '@/designer-components/dynamicActionsConfigurator/configurator';

export const DynamicItemsConfiguratorWrapper: FC<IDynamicItemsConfiguratorSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size } = props;
  return (
    <DynamicActionsConfigurator
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
    />
  );
};
