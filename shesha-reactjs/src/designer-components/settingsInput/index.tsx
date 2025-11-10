import React from 'react';

import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { SettingOutlined } from "@ant-design/icons";
import { SettingInput } from './settingsInput';
import { ISettingsInputProps } from './interfaces';

const SettingsInput: IToolboxComponent<ISettingsInputProps & IConfigurableFormComponent> = {
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
