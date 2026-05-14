import { ISwitchSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { Switch } from 'antd';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const SwitchWrapper: FCUnwrapped<ISwitchSettingsInputProps> = (props) => {
  const { value, onChange, readOnly } = props;
  return (
    <Switch
      value={value}
      onChange={(checked: boolean) => onChange?.(checked)}
      disabled={readOnly}
      size="small"
    />
  );
};
