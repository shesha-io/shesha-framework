import React, { FC, useCallback, useEffect, useState } from 'react';
import { Alert, AutoComplete, Button, Input, InputNumber, Radio, Select, Switch } from "antd";
import { EditableTagGroup, EndpointsAutocomplete, FormComponentSelector, ButtonGroupConfigurator, ColorPicker, FormAutocomplete, LabelValueEditor, PermissionAutocomplete } from '@/components';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { IObjectMetadata } from '@/interfaces/metadata';
import { evaluateString, evaluateValue, executeScript, useAvailableConstantsData, useFormData, useMetadata } from '@/index';
import { ICodeEditorProps } from '@/designer-components/codeEditor/interfaces';
import { useMetadataBuilderFactory } from '@/utils/metadata/hooks';
import camelcase from 'camelcase';
import { MultiColorInput } from '@/designer-components/multiColorInput';
import { useStyles } from './styles';
import { defaultExposedVariables } from '../_settings/settingsControl';
import CustomDropdown from '../_settings/utils/CustomDropdown';
import { Autocomplete } from '@/components/autocomplete';
import { ContextPropertyAutocomplete } from '../contextPropertyAutocomplete';
import { IDropdownOption, ISettingsInputProps } from '../settingsInput/interfaces';
import { QueryBuilder } from '../queryBuilder/queryBuilder';
import { ColumnsConfig } from '../dataTable/table/columnsEditor/columnsConfig';
import { DynamicActionsConfigurator } from '../dynamicActionsConfigurator/configurator';
import { ImagePicker } from '../imagePicker';
import ReferenceListAutocomplete from '@/components/referenceListAutocomplete';
import { IconPickerWrapper } from '../iconPicker/iconPickerWrapper';
import ColumnsList from '../columns/columnsList';
import KeyInformationBarColumnsList from '../keyInformationBar/columnsList';
import SizableColumnsList from '../sizableColumns/sizableColumnList';
import { FiltersList } from '../dataTable/tableViewSelector/filters/filtersList';
import { ItemListConfiguratorModal } from '../itemListConfigurator/itemListConfiguratorModal';
import { ConfigurableActionConfigurator } from '../configurableActionsConfigurator/configurator';
import { formTypes } from '../entityReference/settings';
import { SortingEditor } from '@/components/dataTable/sortingConfigurator';
import RefListItemSelectorSettingsModal from '@/providers/refList/options/modal';
import { FormLayout } from 'antd/es/form/Form';
import { editModes, getEditor, iconElement } from './utils';

const { Password } = Input;

export const InputComponent: FC<Omit<ISettingsInputProps, 'hidden'>> = (props) => {
    const { styles } = useStyles();

    const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
        formTypes.map((i) => {
            return { value: i };
        })
    );

    const metadataBuilderFactory = useMetadataBuilderFactory();
    const { data: formData } = useFormData();
    const { size, className, value, placeholder, type, dropdownOptions, buttonGroupOptions, defaultValue, componentType, tooltipAlt,
        propertyName, tooltip: description, onChange, readOnly, label, availableConstantsExpression, noSelectionItemText, noSelectionItemValue,
        allowClear, dropdownMode, variant, icon, iconAlt, tooltip, dataSourceType, dataSourceUrl, onAddNewItem, listItemSettingsMarkup, propertyAccessor, referenceList, textType, defaultChecked, showSearch = true } = props;

    const allData = useAvailableConstantsData();

    const constantsAccessor = useCallback((): Promise<IObjectMetadata> => {
        if (!availableConstantsExpression?.trim())
            return Promise.reject("AvailableConstantsExpression is mandatory");

        const metadataBuilder = metadataBuilderFactory();

        return executeScript<IObjectMetadata>(availableConstantsExpression, { data: formData, metadataBuilder });
    }, [availableConstantsExpression, metadataBuilderFactory, formData]);

    const functionName = `get${camelcase(label ?? propertyName, { pascalCase: true })}`;

    const codeEditorProps: ICodeEditorProps = {
        readOnly: readOnly,
        description: description,
        mode: props.mode ?? 'dialog',
        language: props.language ?? 'typescript',
        fileName: propertyName,
        label: label ?? propertyName,
        wrapInTemplate: props.wrapInTemplate ?? true,
        value: value,
        onChange: onChange,
        templateSettings: { functionName: functionName },
        exposedVariables: defaultExposedVariables
    };

    const property = propertyAccessor
        ? evaluateString(propertyAccessor, { data: formData })
        : null;

    const meta = useMetadata(false);

    useEffect(() => {
        if (defaultValue && !value) {
            onChange(defaultValue);
        }
    }, [defaultValue]);

    const propertyMeta = property && meta
        ? meta.getPropertyMeta(property)
        : null;

    const verb = props.httpVerb ? evaluateValue(props.httpVerb, { data: formData }) : props.httpVerb;

    switch (type) {
        case 'tooltip':
            return iconElement(icon, null, tooltip, {}, styles);
        case 'dataSortingEditor':
            return <SortingEditor value={value} onChange={onChange} readOnly={readOnly} maxItemsCount={props.maxItemsCount} />;
        case 'colorPicker':
            return <ColorPicker size={size} value={value} readOnly={readOnly} allowClear onChange={onChange} showText={props.showText} />;
        case 'dropdown': {
            const options = dropdownOptions as IDropdownOption[];

            return <Select
                size={size}
                mode={dropdownMode}
                allowClear={allowClear}
                disabled={readOnly}
                variant={variant}
                className={className}
                showSearch={showSearch}
                value={value || defaultValue}
                style={{ width: "100%" }}
                defaultValue={defaultValue}
                onChange={onChange}
                options={[...(options || [])].map(option => ({ ...option, label: iconElement(option.label, option.value, tooltip, {}, styles) }))}
            />;
        }
        case 'radio':
            return <Radio.Group buttonStyle='solid' defaultValue={defaultValue} value={value || defaultValue} onChange={onChange} size={size} disabled={readOnly}>
                {
                    buttonGroupOptions.map(({ value, icon, title }) => {
                        return <Radio.Button key={value} value={value}>{iconElement(icon, null, title, {}, styles) || title}</Radio.Button>;
                    })}
            </Radio.Group>;
        case 'switch':
            /*Handle cases where defaultValue is used in place of defaultChecked*/
            return <Switch disabled={readOnly} size='small'
                defaultChecked={defaultChecked ?? defaultValue} onChange={onChange} defaultValue={defaultValue} value={value} />;
        case 'numberField':
            return <InputNumber
                placeholder={placeholder}
                controls={!icon}
                defaultValue={defaultValue}
                variant={variant} readOnly={readOnly}
                size={size}
                value={value || defaultValue}
                style={{ width: "100%" }}
                onChange={onChange}
                addonAfter={iconElement(icon, null, tooltip || label, {}, styles)}
            />;
        case 'customDropdown': {
            const options = dropdownOptions as IDropdownOption[];

            return <CustomDropdown
                variant={variant} value={value || defaultValue}
                defaultValue={defaultValue} options={options.map(option => ({ ...option, label: iconElement(option.label, option.value, tooltip, {}, styles) }))} readOnly={readOnly} onChange={onChange} size={size} customTooltip={props.customTooltip} />;
        }
        case 'textArea':
            return <Input.TextArea
                rows={2}
                placeholder={placeholder}
                value={value || defaultValue}
                defaultValue={defaultValue}
                readOnly={readOnly} size={size} onChange={onChange} style={{ top: '4px' }} />;
        case 'codeEditor':
            return getEditor(availableConstantsExpression, codeEditorProps, constantsAccessor);
        case 'iconPicker':
            return <IconPickerWrapper iconSize={20} selectBtnSize={size} defaultValue={value} value={value || defaultValue} readOnly={readOnly} onChange={onChange} applicationContext={allData} />;
        case 'imageUploader':
            return <ImagePicker
                value={value || defaultValue}
                readOnly={readOnly}
                onChange={onChange}
            />;
        case 'button':
            return <Button style={{ maxWidth: "100%" }} disabled={readOnly} defaultValue={defaultValue}
                type={value === true ? 'primary' : 'default'} size={size}
                icon={!value ? iconElement(icon, null, tooltip, {}, styles) : iconElement(iconAlt || icon, null, tooltipAlt || tooltip, {}, styles)} onClick={() => onChange(!value)} />;
        case 'filtersList':
            return <FiltersList readOnly={readOnly}  {...props} />;
        case 'buttonGroupConfigurator':
            return <ButtonGroupConfigurator readOnly={readOnly} size={size} value={value} onChange={onChange} />;
        case 'editModeSelector':
            return <Radio.Group buttonStyle='solid' defaultValue={defaultValue} value={value || defaultValue} onChange={onChange} size={size} disabled={readOnly}>
                {editModes.map(({ value, icon, title }) => {
                    return <Radio.Button key={value} value={value}>{iconElement(icon, null, title)}</Radio.Button>;
                })}
            </Radio.Group>;
        case 'dynamicItemsConfigurator':
            return <DynamicActionsConfigurator editorConfig={{ ...props }} readOnly={readOnly} value={value} onChange={onChange} size={size} />;
        case 'autocomplete':
            return <Autocomplete
                dataSourceType={dataSourceType}
                dataSourceUrl={dataSourceUrl}
                readOnly={readOnly}
                value={value || defaultValue}
                placeholder={placeholder}
                defaultValue={defaultValue}
                size={size}
                {...{ ...props, style: {} }}
            />;
        case 'endpointsAutocomplete':
            return <EndpointsAutocomplete {...props} size={size} httpVerb={verb} value={value} onChange={onChange} />;
        case 'referenceListAutocomplete':
            return <ReferenceListAutocomplete value={value} onChange={onChange} readOnly={readOnly} size={size} />;
        case 'queryBuilder':
            return <QueryBuilder {...{ ...props }} hideLabel={true} defaultValue={defaultValue} readOnly={props.readOnly}></QueryBuilder>;
        case 'columnsConfig':
            return <ColumnsConfig size={size} {...props} />;
        case 'columnsList':
            return <ColumnsList {...props} readOnly={readOnly} value={value} onChange={onChange} />;
        case 'keyInformationBarColumnsList':
            return <KeyInformationBarColumnsList {...props} size={size} readOnly={readOnly} value={value} onChange={onChange} />;
        case 'sizableColumnsConfig':
            return <SizableColumnsList {...props} readOnly={readOnly} />;
        case 'editableTagGroupProps':
            return <EditableTagGroup value={value} defaultValue={defaultValue} onChange={onChange} readOnly={props.readOnly} />;
        case 'propertyAutocomplete':
            return <PropertyAutocomplete
                value={value}
                onChange={onChange}
                id={props.id}
                size={size}
                mode={props.mode}
                readOnly={readOnly}
                autoFillProps={props.autoFillProps ?? true}
                allowClear={props.allowClear ?? true}
            />;
        case 'contextPropertyAutocomplete':
            return <ContextPropertyAutocomplete
                {...{ ...props }}
                onValuesChange={onChange}
                style={{}}
                readOnly={readOnly}
                defaultModelType="defaultType"
                id="contextPropertyAutocomplete"
                componentName={formData.componentName}
                propertyName={formData.propertyName}
                contextName={formData.context}
            />;
        case 'formAutocomplete':
            return <FormAutocomplete
                readOnly={readOnly}
                size={props.size ?? 'small'}
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
            return <ItemListConfiguratorModal
                readOnly={readOnly}
                initNewItem={onAddNewItem}
                value={value}
                onChange={onChange}
                size={size}
                settingsMarkupFactory={() => {
                    return {
                        components: listItemSettingsMarkup,
                        formSettings: {
                            colon: false,
                            layout: 'vertical' as FormLayout,
                            labelCol: { span: 24 },
                            wrapperCol: { span: 24 }
                        }
                    };
                }}
                itemRenderer={({ item }) => ({
                    ...item,
                    label: item.title || item.label || item.name,
                    description: item.tooltip
                })}
                buttonText={readOnly ? props.buttonTextReadOnly : props.buttonText}
                modalSettings={
                    {
                        title: readOnly ? props.modalReadonlySettings.title : props.modalSettings.title,
                        header: <Alert message={readOnly ? props.modalReadonlySettings.header : props.modalSettings.header} />
                    }
                }
            />;
        case 'formTypeAutocomplete':
            return <AutoComplete
                disabled={readOnly}
                options={formTypesOptions}
                size={size ?? 'small'}
                value={value}
                onChange={onChange}
                onSearch={(t) =>
                    setFormTypesOptions(
                        (t
                            ? formTypes.filter((f) => {
                                return f.toLowerCase().includes(t.toLowerCase());
                            })
                            : formTypes
                        ).map((i) => {
                            return { value: i };
                        })
                    )
                }
            />;
        case 'configurableActionConfigurator':
            return <ConfigurableActionConfigurator value={value} onChange={onChange} editorConfig={null} level={0} label={label} />;
        case 'typeAutoComplete':
            return <Autocomplete
                dataSourceType="url"
                dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
                readOnly={readOnly}
                size={size}
                value={value}
                onChange={onChange}
            />;
        case 'componentSelector':
            return <FormComponentSelector
                componentType={componentType}
                noSelectionItem={
                    noSelectionItemText ? { label: noSelectionItemText, value: noSelectionItemValue } : undefined
                }
                readOnly={readOnly}
                size={size}
                value={value}
                onChange={onChange}
                propertyMeta={propertyMeta}
            />;
        case 'RefListItemSelectorSettingsModal':
            return <RefListItemSelectorSettingsModal {...props} onChange={(e) => onChange(e)} referenceList={referenceList?._data} readOnly={false} />;

        case 'Password':
            return <Password
                value={value || defaultValue}
                onChange={onChange}
                size={size}
                readOnly={readOnly}
                variant={variant}
            />;
        default:
            return <Input
                size={size}
                onChange={(e) => onChange(e.target.value)}
                readOnly={readOnly}
                defaultValue={defaultValue}
                variant={variant}
                placeholder={placeholder}
                suffix={<span style={{ height: '20px' }}>{iconElement(icon, null, tooltip, {}, styles)}</span>}
                value={value}
                type={textType}
            />;
    }
};

