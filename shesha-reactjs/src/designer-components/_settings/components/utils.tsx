import React, { FC } from 'react';
import { Input, InputNumber, Radio, Select, Switch } from "antd";
import FormItem from "./formItem";
import { CodeEditor, ColorPicker, IconPicker } from '@/components';
import { useSearchQuery } from './tabs/context';
import CustomDropdown from './CustomDropdown';
import TextArea from 'antd/es/input/TextArea';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

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
    property: any;
    type?: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'customDropdown' | 'textarea' | 'code' | 'iconPicker'
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[];
    readOnly: boolean;
    onChange?: (value: any) => void;
    value?: any;
    hasUnits?: boolean;
    hidden?: boolean;
    jsSetting?: boolean;
    children?: React.ReactNode;
    description?: string;
    size?: SizeType;
    hideLabel?: boolean;
}

const { Option } = Select;

const UnitSelector: FC<{ property: string, value: any, onChange }> = ({ value, onChange }) => {

    return (
        <Select
            value={value?.unit || 'px'}
            defaultValue={'px'}
            dropdownStyle={{ minWidth: '70px' }}
            onChange={(unit) => {
                onChange({ unit, value: value?.value || '' });
            }}
        >
            {units.map(unit => (
                <Option key={unit} value={unit} >{unit}</Option>
            ))}
        </Select>
    );
}

const InputComponent: FC<IInputProps> = ({ size, value, type, dropdownOptions, buttonGroupOptions, hasUnits, property, description, onChange, readOnly }) => {

    switch (type) {
        case 'color':
            return <ColorPicker size={size} value={value?.color ?? value} readOnly={readOnly} allowClear onChange={onChange} />;
        case 'dropdown':
            return <Select
                size={size}
                value={value}
                onChange={onChange}
            >
                {dropdownOptions.map(option => (
                    <Option key={option.value} value={value}>
                        {option.label}
                    </Option>
                ))}
            </Select>;
        case 'radio':
            return <Radio.Group value={value} onChange={onChange} size={size} disabled={readOnly}>
                {buttonGroupOptions.map(({ value, icon, title }) => (
                    <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                ))}
            </Radio.Group>;
        case 'switch':
            return <Switch disabled={readOnly} size='small' onChange={onChange} value={value} />;
        case 'number':
            return <InputNumber min={0} max={100} readOnly={readOnly} size={size} value={value} />
        case 'customDropdown':
            return <CustomDropdown value={value} options={dropdownOptions} readOnly={readOnly} onChange={onChange} size={size} />
        case 'textarea':
            return <TextArea readOnly={readOnly} size={size} value={value} />
        case 'code':
            return <CodeEditor mode="dialog" readOnly={readOnly} description={description} size={size} value={value} />;
        case 'iconPicker':
            <IconPicker selectBtnSize='small' readOnly={readOnly} value={value} />
        default:
            return <Input
                size={size}
                onChange={(e) => onChange(hasUnits ? { ...value, value: e.target.value } : e.target.value)}
                readOnly={readOnly}
                defaultValue={''}
                value={hasUnits ? value?.value : value}
                addonAfter={hasUnits ? <UnitSelector onChange={onChange} property={property} value={value} /> : null}
            />;
    }
}

export const SettingInput: React.FC<IInputProps> = ({ children, label, hideLabel, property, type, buttonGroupOptions, dropdownOptions, readOnly, hasUnits, jsSetting, description }) => {
    const { searchQuery } = useSearchQuery();

    if (label.toLowerCase().includes(searchQuery.toLowerCase())) {
        return (
            <div key={label} style={children || property === 'labelAlign' ? { width: 'fit-content' } : { flex: '1 1 120px' }}>
                <FormItem name={`${property}`} label={hideLabel ? null : label} jsSetting={jsSetting} readOnly={readOnly} >
                    {children ? children : <InputComponent size='small' label={label} type={type} dropdownOptions={dropdownOptions} buttonGroupOptions={buttonGroupOptions} hasUnits={hasUnits} property={property} description={description} readOnly={readOnly} />}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px' }}>
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
