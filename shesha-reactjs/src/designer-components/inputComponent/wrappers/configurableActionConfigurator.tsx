import { IConfigurableActionConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ConfigurableActionConfigurator } from '@/designer-components/configurableActionsConfigurator/configurator';

export const ConfigurableActionConfiguratorWrapper: FCUnwrapped<IConfigurableActionConfiguratorSettingsInputProps> = (props) => {
  const { value, onChange, label, hideLabel, allowedActions } = props;
  return (
    <ConfigurableActionConfigurator
      value={value}
      onChange={onChange}
      editorConfig={null}
      level={0}
      label={label}
      allowedActions={allowedActions}
      hideLabel={hideLabel}
    />
  );
};
