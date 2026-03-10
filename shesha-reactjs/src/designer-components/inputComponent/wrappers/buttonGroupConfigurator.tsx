import { IButtonGroupConfiguratorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { ButtonGroupConfigurator } from '@/components';

export const ButtonGroupConfiguratorWrapper: FC<IButtonGroupConfiguratorSettingsInputProps> = (props) => {
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
