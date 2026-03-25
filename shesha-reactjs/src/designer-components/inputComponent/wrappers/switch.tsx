import { ISwitchSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { Switch } from 'antd';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const SwithcWrapper: FCUnwrapped<ISwitchSettingsInputProps> = (props) => {
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
