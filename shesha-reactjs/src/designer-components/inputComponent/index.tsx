import React, { FC, useCallback } from 'react';
import { Button, Input, InputNumber, Radio, Select, Switch, Tooltip } from "antd";
import { CodeEditor, ColorPicker, IconType, PermissionAutocomplete, PropertyAutocomplete, SectionSeparator, ShaIcon } from '@/components';
import TextArea from 'antd/es/input/TextArea';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { ResultType } from '@/components/codeEditor/models';
import { CodeLanguages } from '@/designer-components/codeEditor/types';
import { IObjectMetadata } from '@/interfaces/metadata';
import { executeScript, IComponentLabelProps, useAvailableConstantsData, useFormData } from '@/index';
import { ICodeEditorProps } from '@/designer-components/codeEditor/interfaces';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import camelcase from 'camelcase';
import { CodeEditorWithStandardConstants } from '@/designer-components/codeEditor/codeEditorWithConstants';
import { IconPickerWrapper } from '@/designer-components/iconPicker/iconPickerWrapper';
import ImageUploader from '@/designer-components/imageUploader';
import { MultiColorInput } from '@/designer-components/multiColorInput';
import { useStyles } from './styles';
import { customIcons } from './icons';
import { defaultExposedVariables } from '../_settings/settingsControl';
import { getValueFromString } from '../settingsInput/utils';
import CustomDropdown from '../_settings/utils/CustomDropdown';
import { Autocomplete } from '@/components/autocomplete';
import { SettingInput } from '../settingsInput/settingsInput';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { startCase } from 'lodash';

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
    | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'contextPropertyAutocomplete' |
    'imageUploader' | 'editModeSelector' | 'permissions' | 'typeAutocomplete' | 'multiColorPicker' | 'propertyAutocomplete';
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

const UnitSelector: FC<{ value: any; onChange; readOnly; variant?}> = ({ value, onChange, readOnly, variant }) => {
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
    const { styles } = useStyles();

    const metadataBuilderFactory = useMetadataBuilderFactory();
    const { data: formData } = useFormData();
    const { size, className, value, inputType: type, dropdownOptions, buttonGroupOptions, hasUnits,
        propertyName, tooltip: description, onChange, readOnly, label, availableConstantsExpression,
        allowClear, dropdownMode, variant, icon, iconAlt } = props;

    const iconElement = (icon, size?, tooltip?) => {
        if (typeof icon === 'string') {
            return <Tooltip className={styles.icon} title={tooltip}>
                {icons[icon] ? <ShaIcon iconName={icon as IconType} /> : customIcons[icon] ? customIcons[icon] : icon === 'sectionSeparator' ?
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', verticalAlign: 'middle', top: 10 }}>
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
    const tooltip = startCase(propertyName.split('.')[1]);

    const codeEditorProps: ICodeEditorProps = {
        readOnly: readOnly,
        description: description,
        mode: 'dialog',
        language: 'typescript',
        fileName: propertyName,
        label: label ?? propertyName,
        wrapInTemplate: true,
        value: value,
        onChange: onChange,
        templateSettings: { functionName: functionName },
        exposedVariables: defaultExposedVariables
    };

    const editModes = [
        { value: 'editable', icon: 'edit', title: 'Editable' },
        { value: 'readOnly', icon: 'readonly', title: 'Read only' },
        { value: 'inherit', icon: 'inherit', title: 'Inherit' }
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
                    dropdownOptions.map(option => ({ ...option, label: iconElement(option.label, option.value, tooltip) }))}
            />;
        case 'radio':
            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {buttonGroupOptions.map(({ value, icon, title }) => {

                    return <Radio.Button key={value} value={value} title={title}>{iconElement(icon, null, tooltip)}</Radio.Button>;
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
                    variant={variant} readOnly={readOnly} size={size} value={value} controls={false} />;

        case 'customDropdown':
            return <CustomDropdown
                variant={variant} value={value} options={dropdownOptions} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'textArea':
            return <TextArea readOnly={readOnly} size={size} value={value} onChange={onChange} style={{ top: '4px' }} />;
        case 'codeEditor':
            return editor;
        case 'iconPicker':
            return <IconPickerWrapper iconSize={20} selectBtnSize={size} value={value} readOnly={readOnly} onChange={onChange} applicationContext={allData} />;
        case 'imageUploader':
            return <ImageUploader
                value={value}
                readOnly={readOnly}
                onChange={onChange}
            />;
        case 'button':
            return <Button disabled={readOnly} type={value ? 'primary' : 'default'} size='small' icon={!value ? iconElement(icon, null, tooltip) : iconElement(iconAlt, null, tooltip)} onClick={() => onChange(!value)} />;

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
            />;

        case 'propertyAutocomplete':
            return <PropertyAutocomplete {...props} style={props.style as any} readOnly={readOnly} id="contextPropertyAutocomplete" />;
        case 'contextPropertyAutocomplete':
            return <ContextPropertyAutocomplete {...props} readOnly={readOnly} defaultModelType="defaultType" formData={formData} id="contextPropertyAutocomplete" />;
        case 'permissions':
            return <PermissionAutocomplete value={value} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'multiColorPicker':
            return <MultiColorInput value={value} onChange={onChange} readOnly={readOnly} propertyName={propertyName} />;
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
                    suffix={<span style={{ height: '20px' }}>{iconElement(icon, null, label)} </span>}
                    value={value?.value ? value.value : value}
                />;
    }
};


export interface IInputRowProps {
    inputs: Array<IInputProps>;
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
            const { inputType: type } = props;

            const width = type === 'number' ? 100 :
                type === 'button' ? 24 :
                    type === 'dropdown' ? 100 :
                        type === 'radio' ? props.buttonGroupOptions.length * 30 :
                            type === 'color' ? 24 :
                                type === 'customDropdown' ? 100 : 50;

            return (
                <SettingInput key={i + props.label}
                    {...props}
                    {...(type === 'radio' && {
                        buttonGroupOptions: props.buttonGroupOptions.map(({ value, title, icon }) => {
                            if (!icons[`${icon}`]) {
                                return ({ value, title, icon: null });
                            }
                            const IconComponent = icons[`${icon}`];
                            return ({ value, title, icon: <IconComponent /> });
                        })
                    })}
                    readOnly={readOnly}
                    inline={inline}
                    width={inline && props.icon ? (props.width || width) : inline ? props.width || width : null} />
            );
        })}
        {children}
    </div>;
};
