import React, { FC, useCallback } from 'react';
import { Button, Input, InputNumber, Radio, Select, Switch } from "antd";
import { CodeEditor, ColorPicker, IconType, ShaIcon } from '@/components';
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
import { CopyOutlined, EditOutlined, StopOutlined } from '@ant-design/icons';
import { IconPickerWrapper } from '@/designer-components/iconPicker/iconPickerWrapper';
import { getValueFromString } from './settingsInput/utils';
import { Autocomplete } from '@/components/autocomplete';
import { SettingInput } from './settingsInput/settingsInput';

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
    'imageUploader' | 'editModeSelector' | 'permissions' | 'typeAutocomplete';
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
    exposedVariables?: string[];
    dropdownMode?: 'multiple' | 'tags';
    allowClear?: boolean;
    className?: string;
    icon?: string | React.ReactNode;
    inline?: boolean;
}

interface IInputComponentProps extends IInputProps {
    value?: any;
};

const { Option } = Select;

const UnitSelector: FC<{ value: any; onChange, readOnly }> = ({ value, onChange, readOnly }) => {
    const { styles } = useStyles();

    return (
        <Select
            value={value?.unit || 'px'}
            defaultValue={'px'}
            disabled={readOnly}
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
        allowClear, dropdownMode, variant, icon } = props;

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
                onChange={
                    onChange}
                options={typeof dropdownOptions === 'string' ? getValueFromString(dropdownOptions) : dropdownOptions}
            />;
        case 'radio':
            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {buttonGroupOptions.map(({ value, icon, title }) => {
                    const iconElement = typeof icon === 'string' ? icons[icon] ? <ShaIcon iconName={icon as IconType} /> : icon : icon;

                    return <Radio.Button key={value} value={value} title={title}>{iconElement}</Radio.Button>;
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
                    variant={variant} readOnly={readOnly} size={size} value={value} />

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
            return <Button type='primary' ghost={value ? false : true} size='small' icon={icon} onClick={() => onChange(!value)} />

        case 'editModeSelector':
            const editModes = [
                { value: 'editable', icon: <EditOutlined />, title: 'Editable' },
                { value: 'readOnly', icon: <StopOutlined />, title: 'Read only' },
                { value: 'inherit', icon: <CopyOutlined />, title: 'Inherit' }
            ];
            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {editModes.map(({ value, icon, title }) => (
                    <Radio.Button key={value} value={value} title={title}>{icon}</Radio.Button>
                ))}
            </Radio.Group>;
        case 'typeAutocomplete':
            return <Autocomplete.Raw
                dataSourceType="url"
                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                readOnly={readOnly}
                value={value}
            />
        case 'permissions':
            return <PermissionAutocomplete value={value} readOnly={readOnly} onChange={onChange} size={size} />;
        default:
            return hasUnits ? <Input value={value?.value}
                readOnly={readOnly}
                variant={variant}
                onChange={(value) => onChange(hasUnits ? { ...value, value } : value)}
                size={size}
                addonAfter={<UnitSelector onChange={onChange} value={value} readOnly={readOnly} />} /> :
                <Input
                    size={size}
                    onChange={(e) => onChange(e.target.value)}
                    readOnly={readOnly}
                    defaultValue={''}
                    variant={variant}
                    value={value}
                />;
    }
};


export interface IInputRowProps {
    inputs: Array<IInputProps>;
    readOnly: boolean;
    inline?: boolean;
    children?: React.ReactNode;
}

export const InputRow: React.FC<IInputRowProps> = ({ inputs, readOnly, children, inline }) => {
    const { styles } = useStyles();
    const icons = require('@ant-design/icons');


    return <div className={inline ? styles.inlineInputs : styles.rowInputs}>
        {inputs.map((props, i) => {
            const { inputType: type } = props;

            const width = type === 'button' ? 24 : type === 'dropdown' ? 100 : type === 'radio' ? props.buttonGroupOptions.length * 30 : type === 'color' ? 24 : 50;

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
                    readOnly={props.readOnly || readOnly}
                    inline={inline}
                    width={inline ? props.width || width : ''} />
            )
        })}
        {children}
    </div>;
};

export const filterDynamicComponents = (components, query) => {

    const filterResult = components.map(c => {

        if (c.type === 'collapsiblePanel') {
            return { ...c, content: { ...c.content, components: filterDynamicComponents(c.content.components, query) } };
        }

        if (c.type === 'settingsInputRow') {
            const shouldHide = !c.inputs.map(input => input.label).some(label => label.toLowerCase().includes(query.toLowerCase()));

            return shouldHide ? { ...c, hidden: true } : c;
        }

        if (!c.label && !c.components && (c.type === 'settingsInput')) return c;

        let filteredComponent = { ...c };

        if (c.components) {
            filteredComponent.components = filterDynamicComponents(c.components, query);
        }

        const shouldHideComponent = (c.label && !c.label.toLowerCase().includes(query.toLowerCase()) || c?.label?.props?.children[0].toLowerCase().includes(query.toLowerCase())) ||
            (filteredComponent.components && filteredComponent.components.length === 0);

        filteredComponent.hidden = shouldHideComponent;
        console.log("FILTERED COMPONENTS:::", filteredComponent);

        filteredComponent.className = [c.className, shouldHideComponent ? 'hidden' : ''].filter(Boolean).join(' ');

        return filteredComponent;
    });

    return filterResult.filter(c =>
        c !== null &&
        (!c.hidden || (c.components && c.components.length > 0))
    );
};

