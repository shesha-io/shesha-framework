import { IDynamicItemsConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { DynamicActionsConfigurator } from '@/designer-components/dynamicActionsConfigurator/configurator';

export const DynamicItemsConfiguratorWrapper: FCUnwrapped<IDynamicItemsConfiguratorSettingsInputProps> = (props) => {
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
