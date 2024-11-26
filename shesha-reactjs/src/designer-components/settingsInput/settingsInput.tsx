import React from 'react';

import { IConfigurableFormComponent } from "@/interfaces";
import FormItem from "../_settings/components/formItem";
import { IInputProps, InputComponent } from '../inputComponent';

export interface ISettingsInputProps extends IInputProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName' | 'id' | 'type'> {
}

export const SettingInput: React.FC<ISettingsInputProps> = ({ children, label, hideLabel, propertyName: property, inputType: type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden, width,
    size, inline, validate, ...rest }) => {

    return hidden ? null :
        <div key={label} style={type === 'button' ? { width: '24' } : { flex: `1 1 ${inline ? width : '120px'}`, width }}>
            <FormItem
                name={property}
                hideLabel={hideLabel}
                label={label}
                tooltip={tooltip}
                hidden={hidden}
                required={validate?.required}
                layout='vertical'
                jsSetting={type === 'codeEditor' ? false : jsSetting ? jsSetting : false}
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