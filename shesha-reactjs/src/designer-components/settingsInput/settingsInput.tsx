import React from 'react';

import { IComponentLabelProps, IConfigurableFormComponent } from "@/interfaces";
import FormItem from "../_settings/components/formItem";
import { InputComponent } from '../inputComponent';
import { CodeLanguages } from '../codeEditor/types';
import { ResultType } from '@/components/codeEditor/models';
import { SizeType } from 'antd/es/config-provider/SizeContext';

interface IRadioOption {
    value: string | number;
    icon?: string | React.ReactNode;
    title?: string;
}

interface IDropdownOption {
    label: string | React.ReactNode;
    value: string;
}

interface InputType {
    type: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'button'
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'contextPropertyAutocomplete' | 'text' | 'buttonGroupConfigurator' |
    'imageUploader' | 'editModeSelector' | 'permissions' | 'typeAutocomplete' | 'multiColorPicker' | 'propertyAutocomplete' | 'dynamicItemsConfigurator';
}
export interface ISettingsInputProps extends IComponentLabelProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
    type: InputType['type'];
    label: string;
    propertyName: string;
    variant?: 'borderless' | 'filled' | 'outlined';
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[];
    readOnly?: boolean;
    onChange?: (value: any) => void;
    hasUnits?: boolean;
    hidden?: boolean;
    jsSetting?: boolean;
    children?: React.ReactNode;
    tooltip?: string;
    suffix?: string;
    size?: SizeType;
    width?: string | number;
    hideLabel?: boolean;
    layout?: 'horizontal' | 'vertical';
    language?: CodeLanguages;
    style?: string;
    wrapperCol?: { span: number };
    fileName?: string;
    availableConstantsExpression?: string;
    resultType?: ResultType;
    value?: any;
    exposedVariables?: string[];
    dropdownMode?: 'multiple' | 'tags';
    allowClear?: boolean;
    className?: string;
    icon?: string | React.ReactNode;
    iconAlt?: string | React.ReactNode;
    inline?: boolean;
    inputType?: InputType['type'];
};

export const SettingInput: React.FC<ISettingsInputProps> = ({ children, label, hideLabel, propertyName: property, type,
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
                    type={type}
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