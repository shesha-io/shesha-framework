import { IPasswordSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { Input } from 'antd';
import React, { FC } from 'react';

const { Password } = Input;

export const PasswordWrapper: FC<IPasswordSettingsInputProps> = (props) => {
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
