import React from 'react';

import { IConfigurableFormComponent } from "@/interfaces";
import { useSearchQuery } from "../tabs/context";
import { IInputProps, InputComponent } from "../utils";
import FormItem from "../formItem";

export interface ISettingsInputProps extends IInputProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
}

export const SettingInput: React.FC<IInputProps> = ({ children, label, hideLabel, propertyName: property, inputType: type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden, width,
    size, inline, ...rest }) => {
    const { searchQuery } = useSearchQuery();

    const group = property?.split(".")[1]?.trim();
    const stringToFind = `${group} ${label.toLowerCase()}`?.trim();

    if (stringToFind.includes(searchQuery.toLowerCase()?.trim())) {
        return (hidden ? null :
            <div key={label} style={type === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
                <FormItem
                    name={property}
                    hideLabel={hideLabel}
                    label={label}
                    tooltip={tooltip}
                    jsSetting={type === 'codeEditor' ? false : jsSetting}
                    readOnly={readOnly}>
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