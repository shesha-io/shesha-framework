import { IConfigurableFormComponent } from "@/providers";
import { IInputProps, InputComponent } from "../utils";
import { useSearchQuery } from "../tabs/context";
import FormItem from "../formItem";
import React, { useEffect, useState } from "react";

export interface ISettingsInputProps extends IInputProps, Omit<IConfigurableFormComponent, 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName'> {
}

export const SettingInput: React.FC<IInputProps> = ({ children, label, hideLabel, propertyName: property, inputType: type,
    buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, tooltip, hidden,
    size, ...rest }) => {
    const { searchQuery } = useSearchQuery();
const [isHidden, setIsHidden] = useState(hidden);

useEffect(()=>{
    const group = property?.split(".")[1]?.trim();
    const stringToFind = `${group ?? ''} ${label.toLowerCase()}`?.trim();
    setIsHidden(stringToFind.includes(searchQuery.toLowerCase()?.trim()))
},[searchQuery])
    

        return (isHidden || hidden ? null :
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

};