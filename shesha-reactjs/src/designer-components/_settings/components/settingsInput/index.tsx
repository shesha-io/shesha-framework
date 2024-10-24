import React from 'react';

import { IConfigurableFormComponent, IToolboxComponent } from "@/interfaces";
import { SettingOutlined } from "@ant-design/icons";
import { useSearchQuery } from "../tabs/context";
import { IInputProps, InputComponent } from "../utils";
import FormItem from "../formItem";

export interface ISettingsInputProps extends IInputProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
}

export const SettingInput: React.FC<IInputProps> = ({ children, label, hideLabel, propertyName: property, inputType: type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden,
    size, ...rest }) => {
    const { searchQuery } = useSearchQuery();

    const group = property?.split(".")[1]?.trim();
    const stringToFind = `${group ?? ''} ${label.toLowerCase()}`?.trim();

    if (stringToFind.includes(searchQuery.toLowerCase()?.trim())) {

        return (hidden ? null :
            <div key={label} style={children || property === 'labelAlign' ? { width: 'max-content' } : { flex: '1 1 120px' }}>
                <FormItem
                    name={`${property}`}
                    hideLabel={hideLabel}
                    label={label}
                    tooltip={tooltip}
                    jsSetting={type === 'codeEditor' ? false : jsSetting}
                    readOnly={readOnly}
                    layout={type === 'switch' ? 'horizontal' : 'vertical'}
                    wrapperCol={{ span: type === 'switch' ? 18 : 24 }}
                    labelCol={{ span: type === 'switch' ? 6 : 24 }}>
                    {children || <InputComponent size='small'
                        label={label}
                        inputType={type}
                        dropdownOptions={dropdownOptions}
                        buttonGroupOptions={buttonGroupOptions}
                        hasUnits={hasUnits} propertyName={property}
                        tooltip={tooltip}
                        readOnly={readOnly}
                        {...rest} />
                    }
                </FormItem>
            </div>
        );
    }

    return null;

};

const SettingsInput: IToolboxComponent<ISettingsInputProps> = {
    type: 'settingsInput',
    isInput: true,
    isOutput: true,
    name: 'SettingsInput',
    icon: <SettingOutlined />,
    Factory: ({ model }) => {
        const { label, inputType, dropdownOptions, buttonGroupOptions, hasUnits, propertyName: property, tooltip: description, readOnly } = model;
        return model.hidden ? null : (
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
