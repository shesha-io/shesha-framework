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
    const { label, dropdownOptions, buttonGroupOptions, hasUnits, propertyName: property, tooltip: description, readOnly } = model;


    return (
      model.hidden ? null
        : (
          <SettingInput
            size="small"
            label={label}
            dropdownOptions={dropdownOptions}
            buttonGroupOptions={buttonGroupOptions}
            hasUnits={hasUnits}
            propertyName={property}
            tooltip={description}
            readOnly={readOnly}
            jsSetting={model.jsSetting}
            layout={model.layout}
            {...model}
            type={model.inputType}
          />
        )

    );
  },
};

export default SettingsInput;
