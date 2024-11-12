import React from 'react';

import { IConfigurableFormComponent } from "@/interfaces";
import FormItem from "../_settings/components/formItem";
import { IInputProps, InputComponent } from '../inputComponent';

export interface ISettingsInputProps extends IInputProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
}

export const SettingInput: React.FC<IInputProps> = ({ children, label, hideLabel, propertyName: property, inputType: type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden, width,
    size, inline, ...rest }) => {

    console.log("Setting:::", label, hidden)
    return hidden ? null :
        <div key={label} style={type === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
            <FormItem
                name={property}
                hideLabel={hideLabel}
                label={label}
                tooltip={tooltip}
                layout='vertical'
                jsSetting={type === 'codeEditor' || inline ? false : jsSetting}
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
        ;

};