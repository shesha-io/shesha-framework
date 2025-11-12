import { ISwitchSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { Switch } from 'antd';
import React, { FC } from 'react';

export const SwithcWrapper: FC<ISwitchSettingsInputProps> = (props) => {
  const { value, onChange, readOnly } = props;
  return (
    <Switch
      value={value}
      onChange={onChange}
      disabled={readOnly}
      size="small"
    />
  );
};
