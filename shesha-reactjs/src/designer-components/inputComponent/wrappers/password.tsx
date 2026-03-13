import { IPasswordSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { Input } from 'antd';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

const { Password } = Input;

export const PasswordWrapper: FCUnwrapped<IPasswordSettingsInputProps> = (props) => {
  const { value, onChange, readOnly, size, variant } = props;
  return (
    <Password
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      size={size}
      variant={variant}
    />
  );
};
