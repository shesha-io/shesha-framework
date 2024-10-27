import React, { FC, useCallback } from 'react';
import { Input, InputNumber, Radio, Select, Switch } from "antd";
import { CodeEditor, ColorPicker, IconType, ShaIcon } from '@/components';
import CustomDropdown from './CustomDropdown';
import TextArea from 'antd/es/input/TextArea';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import ImageUploader from '@/designer-components/styleBackground/imageUploader';
import { useStyles } from '../styles/styles';
import { SettingInput } from './settingsInput';
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

const units = ['px', '%', 'em', 'rem', 'vh', 'svh', 'vw', 'svw', 'auto'];
interface IRadioOption {
    value: string | number;
    icon?: React.ReactNode;
    title?: string;
}

export const sizeOptions: IDropdownOption[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
];

export interface IDropdownOption {
    label: string;
    value: string;
}

export interface IInputProps extends IComponentLabelProps {
    label: string;
    propertyName: string;
    inputType?: 'color' | 'dropdown' | 'radio' | 'switch' | 'number' | 'customDropdown' | 'textArea' | 'codeEditor' | 'iconPicker' | 'imageUploader' | 'editModeSelector' | 'permissions';
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
}

interface IInputComponentProps extends IInputProps {
    value?: any;
};

const { Option } = Select;

const UnitSelector: FC<{ property: string; value: any; onChange, readOnly }> = ({ value, onChange, readOnly }) => {
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
        allowClear, dropdownMode } = props;

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
            return <InputNumber readOnly={readOnly} size={size} value={value} className={className} />;
        case 'customDropdown':
            return <CustomDropdown value={value} options={dropdownOptions} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'textArea':
            return <TextArea readOnly={readOnly} size={size} value={value} onChange={onChange} />;
        case 'codeEditor':
            return editor;
        case 'iconPicker':
            return <IconPickerWrapper iconSize={30} selectBtnSize={size} value={value} readOnly={readOnly} onChange={onChange} applicationContext={allData} />;
        case 'imageUploader':
            return <ImageUploader
                backgroundImage={value}
                readOnly={readOnly}
                onChange={onChange}
            />;
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
        case 'permissions':
            return <PermissionAutocomplete value={value} readOnly={readOnly} onChange={onChange} size={size} />;
        default:
            return hasUnits ? <InputNumber value={hasUnits ? value?.value : value}
                readOnly={readOnly}
                onChange={(value) => onChange(hasUnits ? { ...value, value } : value)}
                size={size}
                addonAfter={hasUnits ? <UnitSelector onChange={onChange} property={propertyName} value={value} readOnly={readOnly} /> : null} /> :
                <Input
                    size={size}
                    onChange={(e) => onChange(hasUnits ? { ...value, value: e.target.value } : e.target.value)}
                    readOnly={readOnly}
                    defaultValue={''}
                    value={value}
                />;
    }
};


export interface IInputRowProps {
    inputs: Array<IInputProps>;
    readOnly: boolean;
}

export const InputRow: React.FC<IInputRowProps> = ({ inputs, readOnly }) => {

    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0px 8px' }}>
        {inputs.map((props, i) => (
            <SettingInput key={i + props.label} {...props} readOnly={props.readOnly || readOnly} />
        ))}
    </div>;
};

const styles = ["size", "weight", "color", "align", "max width", "min width", "max height",
    "min height", "width", "height", "blur", "border raduis", " color", " image", " gradient",
    "padding", "margin", "position", "repeat", "hide border", "select corner", "select side", "type", "direction", "offset x", "offset y",
    "url", "file", "spread", "style", "styling box", 'size', 'weight', 'color', 'type', 'align', 'overflow', 'family', 'width',
    'height', 'minWidth', 'minHeight', 'maxHeight', 'maxWidth', 'hide border', 'selected corner radius',
    'selected border side', 'radius', 'style', 'position', 'repeat', 'offset x', 'offset y', 'blur',
    'spread', 'direction', 'url', 'file', 'file id', 'owner type', 'owner id', 'file catergory'];

export const filterDynamicComponents = (components, query) => {

    const filterResult = components.map(c => {

        if (c.type === 'collapsiblePanel') {

            const shouldHidePanel = !styles.some(label => label.toLowerCase().includes(query.toLowerCase()));
            const shouldHideComponents = c.content.components.some(comp => comp.label && !comp.label.toLowerCase().includes(query.toLowerCase()));
            return { ...c, hidden: shouldHidePanel || shouldHideComponents };
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

        const shouldHideComponent =
            (c.label && !c.label.toLowerCase().includes(query.toLowerCase()) || c?.label?.props?.children[0].toLowerCase().includes(query.toLowerCase())) ||
            (filteredComponent.components && filteredComponent.components.length === 0);

        filteredComponent.hidden = shouldHideComponent;
        filteredComponent.className = [c.className, shouldHideComponent ? 'hidden' : ''].filter(Boolean).join(' ');

        return filteredComponent;
    });

    return filterResult.filter(c =>
        c !== null &&
        (!c.hidden || (c.components && c.components.length > 0))
    );
};

