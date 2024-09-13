import React, { FC } from 'react';
import { Button, Input, InputNumber, Radio, Select, Switch } from "antd";
import FormItem from "./formItem";
import { CodeEditor, ColorPicker } from '@/components';
import { useSearchQuery } from './tabs/context';
import CustomDropdown from './CustomDropdown';
import TextArea from 'antd/es/input/TextArea';

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];
interface IRadioOption {
    value: string | number;
    icon?: React.ReactNode;
    title?: string;
}

export interface IDropdownOption {
    label: string;
    value: string;
}

interface IInputProps {
    label: string;
    property: string;
    type?: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'customDropdown' | 'textarea' | 'code'
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[];
    readOnly: boolean;
    onChange?: (value: any) => void;
    value?: any;
    hasUnits?: boolean;
    hidden?: boolean;
    jsSetting?: boolean;
    component?: React.ReactNode;
    description?: string;
    icon?: React.ReactNode;
    className?: string
}

const { Option } = Select;

const UnitSelector: FC<{ property: string, value: any, onChange }> = ({ property, value, onChange }) => {

    return (
        <Select
            value={value?.unit || 'px'}
            defaultValue={'px'}
            dropdownStyle={{ minWidth: '70px' }}
            onChange={(unit) => {
                console.log('UnitSelector', unit, property);
                onChange({ unit })
            }}
        >
            {units.map(unit => (
                <Option key={unit} value={unit} >{unit}</Option>
            ))}
        </Select>
    );
}

const InputComponent: FC<IInputProps> = ({ value, type, dropdownOptions, buttonGroupOptions, hasUnits, property, description, onChange, readOnly }) => {

    console.log(`Input component ${property} onChange`, onChange);

    switch (type) {
        case 'color':
            return <ColorPicker value={value?.color} readOnly={readOnly} allowClear />;
        case 'dropdown':
            return <Select
                value={value}
            >
                {dropdownOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                        {option.label}
                    </Option>
                ))}
            </Select>;
        case 'radio':
            return <Radio.Group value={value}>
                {buttonGroupOptions.map(({ value, icon, title }) => (
                    <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                ))}
            </Radio.Group>;
        case 'switch':
            return <Switch disabled={readOnly} />;
        case 'number':
            return <InputNumber min={0} max={100} readOnly={readOnly} />
        case 'customDropdown':
            return <CustomDropdown value={value} options={dropdownOptions} readOnly={readOnly} />
        case 'textarea':
            return <TextArea readOnly={readOnly} />
        case 'code':
            return <CodeEditor mode="dialog" readOnly={readOnly} description={description} />;

        default:
            return <Input
                value={value}
                readOnly={readOnly}
                addonAfter={hasUnits ? <UnitSelector onChange={onChange} property={property} value={value} /> : null}
            />;
    }
}

export const SettingInput: React.FC<IInputProps> = ({ label, property, type, buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, description, className, icon }) => {
    const { searchQuery } = useSearchQuery();


    if (label.toLowerCase().includes(searchQuery.toLowerCase())) {
        console.log('SettingInput', property, label);
        return (
            <div key={property} style={{ flex: '1 1 120px', minWidth: '100px' }}>
                <FormItem name={hasUnits ? property + '.value' : property} label={label} orientation='vertical' jsSetting={jsSetting} readOnly={readOnly}>
                    <InputComponent className={className} label={label} type={type} dropdownOptions={dropdownOptions} icon={icon} buttonGroupOptions={buttonGroupOptions} hasUnits={hasUnits} property={property} description={description} readOnly={readOnly} />
                </FormItem>
            </div>
        );
    }

    return null

};

interface InputRowProps {
    inputs: Array<IInputProps>;
}

export const InputRow: React.FC<InputRowProps> = ({ inputs }) => {

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px', width: '100%' }}>
            {inputs.map((props) => (
                <SettingInput key={props.label} {...props} />
            ))}
        </div>
    )
};

export const searchFormItems = (children: React.ReactNode, searchQuery: string): React.ReactNode => {

    if (!searchQuery) return children;

    return React.Children.map(children, (child) => {

        if (!React.isValidElement(child)) return null;

        if (child.key === null && !child.props.children) return child;

        if (child.type === 'div' || child.type === React.Fragment) {
            const nestedChildren = searchFormItems(child.props.children, searchQuery);
            return nestedChildren ? React.cloneElement(child, {}, nestedChildren) : null;
        }

        if (child.props.label && typeof child.props.label === 'string') {
            if (child.props.label.toLowerCase().includes(searchQuery.toLowerCase())) {
                return child;
            }
        }
        return null;
    });
};
