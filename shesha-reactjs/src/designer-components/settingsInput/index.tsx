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
    const { label, propertyName: property, tooltip: description, readOnly } = model;


    return (
      model.hidden ? null
        : (
          <SettingInput
            size="small"
            label={label}
            propertyName={property}
            tooltip={description}
            readOnly={readOnly}
            jsSetting={model.jsSetting}
            layout={model.layout}
            {...model}
          />
        )

    );
  },
};

export default SettingsInput;
