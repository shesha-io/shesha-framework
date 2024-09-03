import React from 'react';
import { Radio } from "antd";
import FormItem from "./formItem";

interface IRadioOption {
    value: string;
    icon: React.ReactNode;
    title?: string;
}

interface SettingsRadioGroupProps {
    options: IRadioOption[];
    value: string;
    type: string;
    property?: string;
    name: string;
}

export const SettingsRadioGroup: React.FC<SettingsRadioGroupProps> = ({
    options,
    value,
    type,
    property,
    name
}) => {

    const label = `${type || ''} ${value} ${property || ''}`.trim();

    return (
        <FormItem
            name={name}
            label={label}
            jsSetting
        >
            <Radio.Group>
                {options.map(option => (
                    <Radio.Button
                        key={option.value}
                        value={option.value}
                        title={option.title}
                    >
                        {option.icon}
                    </Radio.Button>
                ))}
            </Radio.Group>
        </FormItem>
    );
};