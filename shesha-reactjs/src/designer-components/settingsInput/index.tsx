import React from 'react';
import { SettingOutlined } from "@ant-design/icons";
import { SettingInput } from './settingsInput';
import { SettingsInputDefinition } from './interfaces';

const SettingsInput: SettingsInputDefinition = {
  type: 'settingsInput',
  isInput: true,
  isOutput: true,
  name: 'SettingsInput',
  icon: <SettingOutlined />,
  Factory: ({ model }) => {
    return model.hidden ? null : <SettingInput size="small" {...model} />;
  },
};

export default SettingsInput;
