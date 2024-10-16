import React, { FC } from 'react';
import { Input, InputNumber, Radio, Select, Switch } from "antd";
import { CodeEditor, ColorPicker, IconPicker } from '@/components';
import { useSearchQuery } from './tabs/context';
import CustomDropdown from './CustomDropdown';
import TextArea from 'antd/es/input/TextArea';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import ImageUploader from '@/designer-components/styleBackground/imageUploader';
import { useStyles } from '../styles/styles';
import { SettingInput } from './settingsInput';
import { CodeTemplateSettings, ResultType } from '@/components/codeEditor/models';
import { CodeLanguages } from '@/designer-components/codeEditor/types';
import { IObjectMetadata } from '@/interfaces/metadata';
import { IComponentLabelProps } from '@/index';
import EditModeSelector from '@/components/editModeSelector';

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

export interface IInputProps extends IComponentLabelProps {
    label: string;
    property: any;
    inputType?: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'customDropdown' | 'textarea' | 'codeEditor' | 'iconPicker' | 'imageUploader' | 'editModeSelector';
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
    layout?: 'horizontal' | 'vertical';
    language?: CodeLanguages;
    style?: string;
    fileName?: string;
    wrapInTemplate?: boolean;
    templateSettings?: CodeTemplateSettings;
    availableConstants?: IObjectMetadata;
    resultType?: ResultType;
    exposedVariables?: string[];
}

const { Option } = Select;

const UnitSelector: FC<{ property: string; value: any; onChange }> = ({ value, onChange }) => {
    const { styles } = useStyles();

    return (
        <Select
            value={value?.unit || 'px'}
            defaultValue={'px'}
            dropdownStyle={{ minWidth: '70px' }}
            onChange={(unit) => {
                onChange({ unit, value: value?.value || '' });
            }}
            className={styles.unitSelector}
        >
            {units.map(unit => (
                <Option key={unit} value={unit} >{unit}</Option>
            ))}
        </Select>
    );
};

export const InputComponent: FC<IInputProps> = ({ size, value, inputType: type, dropdownOptions, buttonGroupOptions, hasUnits, property, description, onChange, readOnly, ...rest }) => {

    const { availableConstants, templateSettings, wrapInTemplate } = rest;

    if (type == 'color') console.log("VALUE:::color:", value);

    switch (type) {
        case 'color':
            return <ColorPicker size={size} value={value} readOnly={readOnly} allowClear onChange={onChange} />;
        case 'dropdown':
            return <Select
                size={size}
                onChange={
                    onChange}
                options={dropdownOptions}
            />;
        case 'radio':
            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {buttonGroupOptions.map(({ value, icon, title }) => (
                    <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                ))}
            </Radio.Group>;
        case 'switch':
            return <Switch disabled={readOnly} size='small' onChange={onChange} value={value} />;
        case 'number':
            return <InputNumber min={0} max={100} readOnly={readOnly} size={size} value={value} />;
        case 'customDropdown':
            return <CustomDropdown value={value} options={dropdownOptions} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'textarea':
            return <TextArea readOnly={readOnly} size={size} value={value} />;
        case 'codeEditor':
            return <CodeEditor mode="dialog" readOnly={readOnly} description={description} size={size} value={value} availableConstants={availableConstants} templateSettings={templateSettings} wrapInTemplate={wrapInTemplate} language="typescript" />;
        case 'iconPicker':
            return <IconPicker value={value} selectBtnSize='small' readOnly={readOnly} onIconChange={onChange} />;
        case 'imageUploader':
            return <ImageUploader
                backgroundImage={value}
                readOnly={readOnly}
                onChange={onChange}
            />;
        case 'editModeSelector':
            return <EditModeSelector value={value} readOnly={readOnly} onChange={onChange} size={size} />;
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
};


interface InputRowProps {
    inputs: Array<IInputProps>;
}

export const InputRow: React.FC<InputRowProps> = ({ inputs }) => {
    const { searchQuery } = useSearchQuery();

    const filteredInputs = inputs.filter(input => input.label.toLowerCase().includes(searchQuery.toLowerCase()));

    console.log("FILTERED INPUTS:::", filteredInputs);

    return filteredInputs.length === 0 ? null : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px' }}>
        {filteredInputs.map((props, i) => (
            <SettingInput key={i + props.label} {...props} />
        ))}
    </div>;
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

export const filterDynamicComponents = (components, query) => {

    const filterResult = components.map(c => {

        if (!c.label && !c.components && c.type === 'settingsInput') return c;

        let filteredComponent = { ...c };

        if (c.components) {
            filteredComponent.components = filterDynamicComponents(c.components, query);
        }

        const shouldHideComponent =
            (c.label && !c.label.toLowerCase().includes(query.toLowerCase()) || c?.label?.props?.children[0].toLowerCase().includes(query.toLowerCase())) ||
            (filteredComponent.components && filteredComponent.components.length === 0);

        filteredComponent.hidden = shouldHideComponent;
        filteredComponent.className = [c.className, shouldHideComponent ? 'hidden' : ''].filter(Boolean).join(' ');

        return filteredComponent;
    });

    // Remove null components and hidden components without children
    return filterResult.filter(c =>
        c !== null &&
        (!c.hidden || (c.components && c.components.length > 0))
    );
};

export function removeEmptyComponent(Node: React.JSX.Element): React.ReactNode {
    if (Node.props.inputs === null || Node.props.children === undefined) {
        return null;
    }

    return Node;
}