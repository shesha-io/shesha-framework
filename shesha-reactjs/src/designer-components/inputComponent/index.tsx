import React, { FC, useCallback } from 'react';
import { Alert, Button, Input, InputNumber, Radio, Select, Space, Switch, Tooltip } from "antd";
import { ButtonGroupConfigurator, CodeEditor, ColorPicker, EditableTagGroup, FormAutocomplete, IconType, LabelValueEditor, PermissionAutocomplete, PropertyAutocomplete, SectionSeparator, ShaIcon } from '@/components';
import TextArea from 'antd/es/input/TextArea';
import { IObjectMetadata } from '@/interfaces/metadata';
import { executeScript, useAvailableConstantsData, useFormData } from '@/index';
import { ICodeEditorProps } from '@/designer-components/codeEditor/interfaces';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import camelcase from 'camelcase';
import { CodeEditorWithStandardConstants } from '@/designer-components/codeEditor/codeEditorWithConstants';
import { IconPickerWrapper } from '@/designer-components/iconPicker/iconPickerWrapper';
import { ImagePicker } from '@/designer-components/imageUploader';
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
import { ISettingsInputProps } from '../settingsInput/interfaces';
import { QueryBuilderWrapper } from '../queryBuilder/queryBuilderWrapper';
import { QueryBuilder } from '../queryBuilder/queryBuilder';
import { ColumnsConfig } from '../dataTable/table/columnsEditor/columnsConfig';
import { DynamicActionsConfigurator } from '../dynamicActionsConfigurator/configurator';
import { ItemListConfiguratorModal } from '../itemListConfigurator/itemListConfiguratorModal';
import { IWizardStepProps } from '../wizard/models';
import { ITabPaneProps } from '../tabs/models';

export const InputComponent: FC<ISettingsInputProps> = (props) => {
    const icons = require('@ant-design/icons');
    const { styles } = useStyles();

    const metadataBuilderFactory = useMetadataBuilderFactory();
    const { data: formData } = useFormData();
    const { size, className, value, type: type, dropdownOptions, buttonGroupOptions,
        propertyName, tooltip: description, onChange, readOnly, label, availableConstantsExpression,
        allowClear, dropdownMode, variant, icon, iconAlt, tooltip, dataSourceType, dataSourceUrl, onAddNewItem, listItemSettingsMarkup } = props;

    const iconElement = (icon: string | React.ReactNode, size?, hint?, style?) => {

        if (typeof icon === 'string') {
            return icons[icon] ?
                <ShaIcon iconName={icon as IconType} style={style} /> :
                customIcons[icon] ?
                    <Tooltip className={styles.icon} title={startCase(propertyName.split('.')[1])}><span style={style}>{customIcons[icon]}</span></Tooltip>
                    : icon === 'sectionSeparator' ?
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', verticalAlign: 'middle', top: 10 }}>
                            <Space>{size} <Tooltip className={styles.icon} title={hint}><SectionSeparator containerStyle={{ margin: 0 }} lineThickness={Number(size[0]) / 2} lineWidth='20' lineColor='#000' fontSize={14} marginBottom={'0px'} /></Tooltip></Space>
                        </div> : icon;
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
        value: value,
        onChange: onChange,
        templateSettings: { functionName: functionName },
        exposedVariables: defaultExposedVariables
    };

    const editModes = [
        { value: 'editable', icon: 'editIcon', title: 'Editable' },
        { value: 'readOnly', icon: 'readonlyIcon', title: 'Read only' },
        { value: 'inherit', icon: 'inheritIcon', title: 'Inherit' }
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
            return <InputNumber min={props.min} max={props.max} variant={variant} readOnly={readOnly} size={size} value={value} onChange={onChange} style={{ width: "100%" }} suffix={<span style={{ height: '20px' }}>{iconElement(icon, null, tooltip)} </span>}
            />;
        case 'customDropdown':
            return <CustomDropdown
                variant={variant} value={value} options={dropdownOptions.map(option => ({ ...option, label: iconElement(option.label, option.value, tooltip) }))} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'textArea':
            return <TextArea readOnly={readOnly} size={size} value={value} onChange={onChange} style={{ top: '4px' }} />;
        case 'codeEditor':
            return editor;
        case 'iconPicker':
            return <IconPickerWrapper iconSize={20} selectBtnSize={size} value={value} readOnly={readOnly} onChange={onChange} applicationContext={allData} />;
        case 'imageUploader':
            return <ImagePicker
                value={value}
                readOnly={readOnly}
                onChange={onChange}
            />;
        case 'button':
            return <Button disabled={readOnly} type={value ? 'primary' : 'default'} size='small' icon={!value ? iconElement(icon, null, tooltip) : iconElement(iconAlt, null, tooltip)} onClick={() => onChange(!value)} />;
        case 'buttonGroupConfigurator':
            return <ButtonGroupConfigurator readOnly={readOnly} size={size} value={value} onChange={onChange} />;
        case 'editModeSelector':
            return <Radio.Group buttonStyle='solid' defaultValue={value} value={value} onChange={onChange} size={size} disabled={readOnly}>
                {editModes.map(({ value, icon, title }) => (
                    <Radio.Button key={value} value={value} title={title}>{iconElement(icon)}</Radio.Button>
                ))}
            </Radio.Group>;
        case 'buttonGroupConfigurator':
            return <ButtonGroupConfigurator readOnly={readOnly} size={size} value={value} onChange={onChange} />;
        case 'dynamicItemsConfigurator':
            <DynamicActionsConfigurator editorConfig={props} readOnly={readOnly} value={value} onChange={onChange} />;
        case 'autocomplete':
            return <Autocomplete.Raw
                dataSourceType={dataSourceType}
                dataSourceUrl={dataSourceUrl}
                readOnly={readOnly}
                value={value}
                size={size}
                {...{ ...props, style: {} }}
            />;
        case 'queryBuilder':
            return <QueryBuilderWrapper>
                <QueryBuilder {...props} hideLabel={true} readOnly={props.readOnly}></QueryBuilder>
            </QueryBuilderWrapper>;
        case 'columnsConfig':
            return <ColumnsConfig size={size} />;
        case 'editableTagGroupProps':
            return <EditableTagGroup value={value} defaultValue={props?.defaultValue} onChange={onChange} readOnly={props.readOnly} />;
        case 'propertyAutocomplete':
            return <PropertyAutocomplete {...props} style={props.style as any} readOnly={readOnly} id="contextPropertyAutocomplete" />;
        case 'contextPropertyAutocomplete':
            return <ContextPropertyAutocomplete {...props} readOnly={readOnly} defaultModelType="defaultType" formData={formData} id="contextPropertyAutocomplete" />;
        case 'formAutocomplete':
            return <FormAutocomplete
                readOnly={readOnly}
                convertToFullId={false}
                value={value}
                onChange={onChange}
            />;
        case 'labelValueEditor':
            return <LabelValueEditor {...props} exposedVariables={codeEditorProps.exposedVariables} />;
        case 'permissions':
            return <PermissionAutocomplete value={value} readOnly={readOnly} onChange={onChange} size={size} />;
        case 'multiColorPicker':
            return <MultiColorInput value={value} onChange={onChange} readOnly={readOnly} propertyName={propertyName} />;
        case 'itemListConfiguratorModal':

            return <ItemListConfiguratorModal<ITabPaneProps | IWizardStepProps>
                readOnly={readOnly}
                initNewItem={onAddNewItem}
                value={value}
                onChange={onChange}
                settingsMarkupFactory={() => {
                    return {
                        components: listItemSettingsMarkup,
                        formSettings: {
                            layout: "horizontal",
                            isSettingsForm: true,
                            colon: true,
                            labelCol: { span: 5 },
                            wrapperCol: { span: 13 }
                        }
                    };
                }}
                itemRenderer={({ item }) => ({
                    label: item.title || item.label || item.name,
                    description: item.tooltip,
                    ...item
                })}
                buttonText={readOnly ? "View Tab Panes" : "Configure Tab Panes"}
                modalSettings={{
                    title: readOnly ? "View Tab Panes" : "Configure Tab Panes",
                    header: <Alert message={readOnly ? 'Here you can view tab panes configuration.' : 'Here you can configure the tab panes by adjusting their settings and ordering.'} />,
                }}
                actualModelContext={constantsAccessor}
            >
            </ItemListConfiguratorModal>;
        default:
            return <Input
                size={size}
                onChange={(e) => onChange(e.target.value)}
                readOnly={readOnly}
                defaultValue={''}
                variant={variant}
                suffix={<span style={{ height: '20px' }}>{iconElement(icon, null, tooltip)} </span>}
                value={value?.value ? value.value : value}
            />;
    }
};


export interface IInputRowProps {
    inputs: Array<ISettingsInputProps>;
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
            const { type } = props;

            const width = type === 'number' ? 100 :
                type === 'button' ? 24 :
                    type === 'dropdown' ? 120 :
                        type === 'radio' ? props.buttonGroupOptions.length * 30 :
                            type === 'color' ? 24 :
                                type === 'customDropdown' ? 120 : 50;

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
