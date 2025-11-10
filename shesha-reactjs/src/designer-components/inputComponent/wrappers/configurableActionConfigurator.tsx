import { IConfigurableActionConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { ConfigurableActionConfigurator } from '@/designer-components/configurableActionsConfigurator/configurator';

export const ConfigurableActionConfiguratorWrapper: FC<IConfigurableActionConfiguratorSettingsInputProps> = (props) => {
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
