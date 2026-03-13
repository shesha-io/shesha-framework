import { IButtonGroupConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';
import { ButtonGroupConfigurator } from '@/components';

export const ButtonGroupConfiguratorWrapper: FCUnwrapped<IButtonGroupConfiguratorSettingsInputProps> = (props) => {
  const { value, readOnly, size, onChange, buttonText, buttonTextReadOnly, title } = props;
  return (
    <ButtonGroupConfigurator
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
      buttonText={buttonText}
      buttonTextReadOnly={buttonTextReadOnly}
      title={title}
    />
  );
};
