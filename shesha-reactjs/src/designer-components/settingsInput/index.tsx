import React from 'react';

import { IToolboxComponent } from "@/interfaces";
import { SettingOutlined } from "@ant-design/icons";
import { ISettingsInputProps, SettingInput } from './settingsInput';

const SettingsInput: IToolboxComponent<ISettingsInputProps> = {
    type: 'settingsInput',
    isInput: true,
    isOutput: true,
    name: 'SettingsInput',
    icon: <SettingOutlined />,
    Factory: ({ model }) => {
        const { label, inputType, dropdownOptions, buttonGroupOptions, hasUnits, propertyName: property, tooltip: description, readOnly, hidden } = model;
        return hidden ? null : (
            <SettingInput size='small'
                label={label}
                inputType={inputType}
                dropdownOptions={dropdownOptions}
                buttonGroupOptions={buttonGroupOptions}
                hasUnits={hasUnits} propertyName={property}
                tooltip={description}
                readOnly={readOnly}
                jsSetting={model.jsSetting}
                layout={model.layout}
                {...model} />

        );
    }
};

export default SettingsInput;
