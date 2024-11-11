import React, { FC, useCallback } from 'react';
import { Button, Input, InputNumber, Radio, Select, Switch, Tooltip } from "antd";
import { CodeEditor, ColorPicker, IconType, SectionSeparator, ShaIcon } from '@/components';
import CustomDropdown from './CustomDropdown';
import TextArea from 'antd/es/input/TextArea';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import ImageUploader from '@/designer-components/styleBackground/imageUploader';
import { useStyles } from '../styles/styles';
import { ResultType } from '@/components/codeEditor/models';
import { CodeLanguages } from '@/designer-components/codeEditor/types';
import { IObjectMetadata } from '@/interfaces/metadata';
import { executeScript, IComponentLabelProps, useAvailableConstantsData, useFormData } from '@/index';
import PermissionAutocomplete from '@/components/permissionAutocomplete';
import { ICodeEditorProps } from '@/designer-components/codeEditor/interfaces';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import camelcase from 'camelcase';
import { defaultExposedVariables } from '../settingsControl';
import { CodeEditorWithStandardConstants } from '@/designer-components/codeEditor/codeEditorWithConstants';
import { IconPickerWrapper } from '@/designer-components/iconPicker/iconPickerWrapper';
import { getValueFromString } from './settingsInput/utils';
import { Autocomplete } from '@/components/autocomplete';
import { SettingInput } from './settingsInput/settingsInput';
import { MultiColorInput } from '@/designer-components/styleBackground/multiColorInput';
import { customIcons } from './icons';

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];
interface IRadioOption {
    value: string | number;
    icon?: string | React.ReactNode;
    title?: string;
}

export const sizeOptions: IRadioOption[] = [
    { title: 'Small', value: 'small', icon: <span style={{ fontWeight: 500, fontSize: 16 }}>S</span> },
    { title: 'Medium', value: 'medium', icon: <span style={{ fontWeight: 500, fontSize: 16 }}>M</span> },
    { title: 'Large', value: 'large', icon: <span style={{ fontWeight: 500, fontSize: 16 }}>L</span> },
];

interface IDropdownOption {
    label: string | React.ReactNode;
    value: string;
}

export interface IInputProps extends IComponentLabelProps {
    label: string;
    propertyName: string;
    inputType?: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'button'
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' |
    'imageUploader' | 'editModeSelector' | 'permissions' | 'typeAutocomplete' | 'multiColorPicker';
    variant?: 'borderless' | 'filled' | 'outlined';
    buttonGroupOptions?: IRadioOption[];
    dropdownOptions?: IDropdownOption[];
    readOnly: boolean;
    onChange?: (value: any) => void;
    hasUnits?: boolean;
    hidden?: boolean;
    jsSetting?: boolean;
    children?: React.ReactNode;
    tooltip?: string;
    suffix?: string;
    size?: SizeType;
    width?: number;
    hideLabel?: boolean;
    layout?: 'horizontal' | 'vertical';
    language?: CodeLanguages;
    style?: string;
    wrapperCol?: { span: number };
    fileName?: string;
    availableConstantsExpression?: string;
    resultType?: ResultType;
    exposedVariables?: string[];
    dropdownMode?: 'multiple' | 'tags';
    allowClear?: boolean;
    className?: string;
    icon?: string | React.ReactNode;
    iconAlt?: string | React.ReactNode;
    inline?: boolean;
}

interface IInputComponentProps extends IInputProps {
    value?: any;
};

const { Option } = Select;

const UnitSelector: FC<{ value: any; onChange, readOnly, variant?}> = ({ value, onChange, readOnly, variant }) => {
    const { styles } = useStyles();

    return (
        <Select
            value={value?.unit || 'px'}
            defaultValue={'px'}
            disabled={readOnly}
            variant={variant}
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

export const InputComponent: FC<IInputComponentProps> = (props) => {
    const icons = require('@ant-design/icons');

    const metadataBuilderFactory = useMetadataBuilderFactory();
    const { data: formData } = useFormData();
    const { size, className, value, inputType: type, dropdownOptions, buttonGroupOptions, hasUnits,
        propertyName, tooltip: description, onChange, readOnly, label, availableConstantsExpression,
        allowClear, dropdownMode, variant, icon, iconAlt } = props;

    const iconElement = (icon, size?) => {
        if (typeof icon === 'string') {
            return <Tooltip title={label}> {icons[icon] ? <ShaIcon iconName={icon as IconType} /> : customIcons[icon] ? customIcons[icon] : icon === 'sectionSeparator' ?
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', verticalAlign: 'middle' }}>
                    {size}<SectionSeparator containerStyle={{ margin: 0 }} lineThickness={Number(size[0]) / 2} lineWidth='24' lineColor='#000' fontSize={14} marginBottom={'0px'} />
                </div>
                : icon}
            </Tooltip>;
        }
        return icon;
    };

    const allData = useAvailableConstantsData();

    const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
        if (!availableConstantsExpression?.trim())
            return Promise.reject("AvailableConstantsExpression is mandatory");

        const metadataBuilder = metadataBuilderFactory();

        return executeScript<IObjectMetadata>(availableConstantsExpression, { data: formData, metadataBuilder });
    }, [availableConstantsExpression, metadataBuilderFactory, formData]);

    const functionName = `get${camelcase(propertyName, { pascalCase: true })}`;

    const codeEditorProps: ICodeEditorProps = {
        readOnly: readOnly,
        description: description,
        mode: 'dialog',
        language: 'typescript',
        fileName: propertyName,
        label: label ?? propertyName,
        wrapInTemplate: true,
        templateSettings: { functionName: functionName },
        exposedVariables: defaultExposedVariables
    };

    const editModes = [
        { value: 'editable', icon: 'EditOutlined', title: 'Editable' },
        { value: 'readOnly', icon: 'EyeVisibleOutlined', title: 'Read only' },
        { value: 'inherit', icon: 'ApartmentOutlined', title: 'Inherit' }
    ];

    const editor = availableConstantsExpression?.trim()
        ? <CodeEditor {...codeEditorProps} availableConstants={constantsAccessor} />
        : <CodeEditorWithStandardConstants {...codeEditorProps} />;

    switch (type) {
        case 'color':
            return <ColorPicker size={size} value={value} readOnly={readOnly} allowClear onChange={onChange} />;
        case 'dropdown':
            return <Select
                size={size}
                mode={dropdownMode}
                allowClear={allowClear}
                disabled={readOnly}
                variant={variant}
                className={className}
                value={value}
                onChange={
                    onChange}
                options={typeof dropdownOptions === 'string' ?
                    getValueFromString(dropdownOptions) :
                    dropdownOptions.map(option => ({ ...option, label: iconElement(option.label, option.value) }))}
            />;
        case 'radio':
            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {buttonGroupOptions.map(({ value, icon, title }) => {

                    return <Radio.Button key={value} value={value} title={title}>{iconElement(icon)}</Radio.Button>;
                })}
            </Radio.Group>;
        case 'switch':
            return <Switch disabled={readOnly} size='small' onChange={onChange} value={value} />;
        case 'number':
            return hasUnits ? <InputNumber
                controls={false}
                value={hasUnits ? value?.value : value}
                readOnly={readOnly}
                variant={variant}
                onChange={(value) => onChange(hasUnits ? { ...value, value } : value)}
                size={size}
                addonAfter={hasUnits ? <UnitSelector onChange={onChange} value={value} readOnly={readOnly} />
                    : null} /> :
                <InputNumber
                    variant={variant} readOnly={readOnly} size={size} value={value} controls={false} />

        case 'customDropdown':
            return <CustomDropdown
                variant={variant} value={value} options={dropdownOptions} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'textArea':
            return <TextArea readOnly={readOnly} size={size} value={value} onChange={onChange} />;
        case 'codeEditor':
            return editor;
        case 'iconPicker':
            return <IconPickerWrapper iconSize={30} selectBtnSize={size} value={value} readOnly={readOnly} onChange={onChange} applicationContext={allData} />;
        case 'imageUploader':
            return <ImageUploader
                value={value}
                readOnly={readOnly}
                onChange={onChange}
            />;
        case 'button':
            return <Button type={value ? 'primary' : 'default'} size='small' icon={!value ? iconElement(icon) : iconElement(iconAlt)} onClick={() => onChange(!value)} />

        case 'editModeSelector':

            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {editModes.map(({ value, icon, title }) => (
                    <Radio.Button key={value} value={value} title={title}>{iconElement(icon)}</Radio.Button>
                ))}
            </Radio.Group>;

        case 'typeAutocomplete':
            return <Autocomplete.Raw
                dataSourceType="url"
                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                readOnly={readOnly}
                value={value}
                size={size}
            />
        case 'permissions':
            return <PermissionAutocomplete value={value} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'multiColorPicker':
            return <MultiColorInput value={value} onChange={onChange} readOnly={readOnly} />;
        default:
            return hasUnits ? <Input
                readOnly={readOnly}
                suffix={<UnitSelector variant='borderless' onChange={onChange} value={value} readOnly={readOnly} />}
                value={hasUnits ? value?.value : value}
                variant={variant}
                onChange={(e) => onChange(hasUnits ? { ...value, value: e.target.value } : value)}
                size={size}
                addonAfter={iconElement(icon)}
                style={{ textAlign: 'right' }}
            /> :
                <Input
                    size={size}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    defaultValue={''}
                    variant={variant}
                    suffix={iconElement(icon)}
                    value={value?.value ? value.value : value}
                />;
    }
};


export interface IInputRowProps {
    inputs: Array<Omit<IInputProps, 'readOnly'>>;
    readOnly: boolean;
    inline?: boolean;
    children?: React.ReactNode;
    hidden?: boolean;
}

export const InputRow: React.FC<IInputRowProps> = ({ inputs, readOnly, children, inline, hidden }) => {
    const { styles } = useStyles();
    const icons = require('@ant-design/icons');

    return hidden ? null : <div className={inline ? styles.inlineInputs : styles.rowInputs}>
        {inputs.map((props, i) => {
            const { inputType: type, hasUnits } = props;

            const width = type === 'number' ? 100 : type === 'button' ? 24 : type === 'dropdown' ? 100 : type === 'radio' ? props.buttonGroupOptions.length * 30 : type === 'color' ? 24 : type === 'customDropdown' ? 100 : 50;

            return (
                <SettingInput key={i + props.label}
                    {...props}
                    {...(type === 'radio' && {
                        buttonGroupOptions: props.buttonGroupOptions.map(({ value, title, icon }) => {
                            if (!icons[`${icon}`]) {
                                return ({ value, title, icon: null })
                            }

                            const IconComponent = icons[`${icon}`];
                            return ({ value, title, icon: <IconComponent /> })
                        })
                    })}
                    readOnly={readOnly}
                    inline={inline}
                    width={inline && props.icon ? (props.width || width) + (hasUnits ? 10 : 0) : inline ? props.width || width : null} />
            )
        })}
        {children}
    </div>;
};

/**
 * Evaluates a string expression in the context of the provided data object.
 * @param expression The string expression to evaluate.
 * @param data The data object to use as context for the evaluation.
 * @returns The result of the evaluated expression.
 */
const evaluateString = (expression: string, data: any): any => {
    try {
        // Create a new function with 'data' as a parameter and the expression as the function body
        const func = new Function('data', expression);
        // Execute the function with the provided data
        return func(data);
    } catch (error) {
        console.error('Error evaluating expression:', expression, error);
        return null;
    }
};

export const filterDynamicComponents = (components, query, data) => {
    if (!components || !Array.isArray(components)) return [];

    const lowerCaseQuery = query.toLowerCase();

    // Helper function to evaluate hidden property
    const evaluateHidden = (hidden, directMatch, hasVisibleChildren) => {
        if (typeof hidden === 'string') {
            console.log("evaluate hidden property Hidden::  ", hidden, " :: ", evaluateString(hidden, data));
            return evaluateString(hidden, data);
        }
        return hidden || (!directMatch && !hasVisibleChildren);
    };

    // Helper function to check if text matches query
    const matchesQuery = (text) => text?.toLowerCase().includes(lowerCaseQuery);

    const filterResult = components.map(component => {
        // Deep clone the component to avoid mutations
        const c = { ...component };

        // Check if component matches query directly
        const directMatch = (
            matchesQuery(c.label) ||
            matchesQuery(c.propertyName) ||
            (c.propertyName && matchesQuery(c.propertyName.split('.').join(' ')))
        );

        // Handle propertyRouter
        if (c.type === 'propertyRouter') {
            const filteredComponents = filterDynamicComponents(c.components, query, data);
            const hasVisibleChildren = filteredComponents.length > 0;
            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle collapsiblePanel
        if (c.type === 'collapsiblePanel') {
            const contentComponents = filterDynamicComponents(c.content?.components || [], query, data);
            const hasVisibleChildren = contentComponents.length > 0;

            return {
                ...c,
                content: {
                    ...c.content,
                    components: contentComponents
                },
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle settingsInputRow
        if (c.type === 'settingsInputRow') {
            const filteredInputs = c.inputs?.filter(input =>
                matchesQuery(input.label) ||
                matchesQuery(input.propertyName) ||
                (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
            ) || [];

            return {
                ...c,
                inputs: filteredInputs,
                hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0)
            };
        }

        // Handle components with nested components
        if (c.components) {
            const filteredComponents = filterDynamicComponents(c.components, query, data);
            const hasVisibleChildren = filteredComponents.length > 0;

            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle inputs array if present
        if (c.inputs) {
            const filteredInputs = c.inputs?.filter(input =>
                matchesQuery(input.label) ||
                matchesQuery(input.propertyName) ||
                (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
            ) || [];

            return {
                ...c,
                inputs: filteredInputs,
                hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0)
            };
        }

        // Handle basic component
        return {
            ...c,
            hidden: evaluateHidden(c.hidden, directMatch, false)
        };
    });

    // Filter out null components and handle visibility
    return filterResult.filter(c => {
        if (!c) return false;

        // Evaluate final hidden state
        const hasVisibleChildren = (
            (c.components && c.components.length > 0) ||
            (c.content?.components && c.content.components.length > 0) ||
            (c.inputs && c.inputs.length > 0)
        );

        const isHidden = typeof c.hidden === 'string'
            ? evaluateString(c.hidden, data)
            : c.hidden;

        return !isHidden || hasVisibleChildren;
    });
};