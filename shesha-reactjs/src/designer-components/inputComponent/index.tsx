import React, { FC, useCallback, useEffect, useState } from 'react';
import { Alert, AutoComplete, Button, Input, InputNumber, Radio, Select, Switch } from "antd";
import { EditableTagGroup, EndpointsAutocomplete, FormComponentSelector, ButtonGroupConfigurator, ColorPicker, FormAutocomplete, LabelValueEditor, PermissionAutocomplete } from '@/components';
import { PropertyAutocomplete } from '@/components/propertyAutocomplete/propertyAutocomplete';
import { IObjectMetadata } from '@/interfaces/metadata';
import { evaluateString, evaluateValueAsString, executeScript, useAvailableConstantsData, useMetadata, useShaFormInstance } from '@/index';
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
import RefListItemSelectorSettingsModal from '@/components/refListSelectorDisplay/options/modal';
import { FormLayout } from 'antd/es/form/Form';
import { CustomLabelValueEditorInputs, getEditor } from './utils';
import EditModeSelector from '@/components/editModeSelector';
import Icon from '@/components/icon/Icon';
import { IQueryBuilderComponentProps } from '../queryBuilder/interfaces';
import { IDynamicActionsConfiguratorComponentProps } from '../dynamicActionsConfigurator/interfaces';

const { Password } = Input;

export const InputComponent: FC<Omit<ISettingsInputProps, 'hidden'>> = (props) => {
  const { styles } = useStyles();

  const [formTypesOptions, setFormTypesOptions] = useState<{ value: string }[]>(
    formTypes.map((i) => {
      return { value: i };
    }),
  );

  const metadataBuilderFactory = useMetadataBuilderFactory();
  const { formData, setFormData } = useShaFormInstance();
  const { size, className, value, placeholder, type, dropdownOptions, buttonGroupOptions, defaultValue, componentType, tooltipAlt, iconSize,

    propertyName, tooltip: description, onChangeSetting, onChange, readOnly, label, availableConstantsExpression, noSelectionItemText, noSelectionItemValue,
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
    templateSettings: props.templateSettings ?? { functionName: functionName },
    exposedVariables: defaultExposedVariables,
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

  const verb = props.httpVerb ? evaluateValueAsString(props.httpVerb, { data: formData }) : props.httpVerb;

  const internalOnChange = (v: any): void => {
    onChangeSetting?.(v, formData, setFormData);
    onChange?.(v);
  };

  switch (type) {
    case 'tooltip':
      return <Icon icon={icon} hint={tooltip} styles={styles} />;
    case 'dataSortingEditor':
      return <SortingEditor value={value} onChange={internalOnChange} readOnly={readOnly} maxItemsCount={props.maxItemsCount} />;
    case 'colorPicker':
      return <ColorPicker size={size} value={value} readOnly={readOnly} allowClear onChange={internalOnChange} showText={props.showText} />;
    case 'dropdown': {
      const options = dropdownOptions as IDropdownOption[];
      return (
        <Select
          size={size}
          mode={dropdownMode}
          allowClear={allowClear ?? true}
          disabled={readOnly}
          variant={variant}
          className={className}
          showSearch={showSearch}
          value={!value ? defaultValue : value}
          defaultValue={defaultValue}
          style={{ width: props.width ?? "100%" }}
          onChange={internalOnChange}
          onSelect={internalOnChange}
          placeholder={placeholder}
          options={[...(options || [])].map((option) => ({ ...option, label: <Icon icon={option.label} size={option.value} styles={styles} hint={tooltip} /> }))}
        />
      );
    }
    case 'radio':
      return (
        <Radio.Group buttonStyle="solid" defaultValue={defaultValue} value={value || defaultValue} onChange={internalOnChange} size={size} disabled={readOnly}>
          {
            buttonGroupOptions.map(({ value, icon, title }) => {
              return <Radio.Button key={value} value={value}>{icon ? <Icon icon={icon || title} hint={title} styles={styles} /> : title}</Radio.Button>;
            })
          }
        </Radio.Group>
      );
    case 'switch':
      /* Handle cases where defaultValue is used in place of defaultChecked*/
      return (
        <Switch
          disabled={readOnly}
          size="small"
          defaultChecked={defaultChecked ?? defaultValue}
          onChange={internalOnChange}
          value={value}
        />
      );
    case 'numberField':
      return (
        <InputNumber
          placeholder={placeholder}
          controls={!icon}
          defaultValue={defaultValue}
          variant={variant}
          readOnly={readOnly}
          size={size}
          value={value}
          style={{ width: "100%" }}
          min={props.min}
          onChange={internalOnChange}
          addonAfter={icon ? <Icon icon={icon} hint={tooltip || label} styles={styles} /> : null}
        />
      );
    case 'customDropdown': {
      const options = dropdownOptions as IDropdownOption[];

      return (
        <CustomDropdown
          value={value || defaultValue}
          placeholder={placeholder}
          defaultValue={defaultValue}
          options={options.map((option) => ({ ...option, label: <Icon icon={option.label} hint={tooltip} styles={styles} /> }))}
          readOnly={readOnly}
          onChange={internalOnChange}
          size={size}
          customTooltip={props.customTooltip}
        />
      );
    }
    case 'customLabelValueEditor': {
      return <CustomLabelValueEditorInputs {...props} exposedVariables={null} />;
    }
    case 'textArea':
      return (
        <Input.TextArea
          rows={2}
          placeholder={placeholder}
          value={value || defaultValue}
          defaultValue={defaultValue}
          readOnly={readOnly}
          size={size}
          onChange={internalOnChange}
          style={{ top: '4px' }}
        />
      );
    case 'codeEditor':
      return getEditor(availableConstantsExpression, codeEditorProps, constantsAccessor);
    case 'iconPicker':
      return <IconPickerWrapper iconSize={iconSize ?? 20} selectBtnSize={size} defaultValue={value} value={value || defaultValue} readOnly={readOnly} onChange={internalOnChange} applicationContext={allData} />;
    case 'imageUploader':
      return (
        <ImagePicker
          value={value || defaultValue}
          readOnly={readOnly}
          onChange={internalOnChange}
        />
      );
    case 'button':
      return (
        <Button
          style={{ maxWidth: "100%" }}
          disabled={readOnly}
          defaultValue={defaultValue}
          type={value === true ? 'primary' : 'default'}
          size={size}
          icon={!value ? <Icon icon={icon} hint={tooltip} styles={styles} /> : <Icon icon={iconAlt || icon} hint={tooltipAlt || tooltip} styles={styles} />}
          onClick={() => onChange(!value)}
        />
      );
    case 'filtersList':
      return <FiltersList readOnly={readOnly} {...props} />;
    case 'buttonGroupConfigurator':
      return <ButtonGroupConfigurator readOnly={readOnly} size={size} value={value} onChange={internalOnChange} />;
    case 'editModeSelector':
      return <EditModeSelector readOnly={readOnly} value={value} onChange={internalOnChange} size={size} />;
    case 'dynamicItemsConfigurator':
      return <DynamicActionsConfigurator editorConfig={{ ...props } as IDynamicActionsConfiguratorComponentProps} readOnly={readOnly} value={value} onChange={internalOnChange} size={size} />;
    case 'autocomplete':
      return (
        <Autocomplete
          dataSourceType={dataSourceType}
          dataSourceUrl={dataSourceUrl}
          readOnly={readOnly}
          value={value || defaultValue}
          placeholder={placeholder}
          defaultValue={defaultValue}
          size={size}
          {...props}
          style={{}}
        />
      );
    case 'endpointsAutocomplete':
      return <EndpointsAutocomplete {...props} size={size} httpVerb={verb} value={value} onChange={internalOnChange} />;
    case 'referenceListAutocomplete':
      return <ReferenceListAutocomplete value={value} onChange={internalOnChange} readOnly={readOnly} size={size} />;
    case 'queryBuilder':
      return <QueryBuilder {...props as IQueryBuilderComponentProps} hideLabel={true} defaultValue={defaultValue} readOnly={props.readOnly} />;
    case 'columnsConfig':
      return <ColumnsConfig size={size} {...props} />;
    case 'columnsList':
      return <ColumnsList {...props} readOnly={readOnly} value={value} onChange={internalOnChange} />;
    case 'keyInformationBarColumnsList':
      return <KeyInformationBarColumnsList {...props} size={size} readOnly={readOnly} value={value} onChange={internalOnChange} />;
    case 'sizableColumnsConfig':
      return <SizableColumnsList {...props} readOnly={readOnly} />;
    case 'editableTagGroupProps':
      return <EditableTagGroup value={value} defaultValue={defaultValue} onChange={internalOnChange} readOnly={props.readOnly} />;
    case 'propertyAutocomplete':
      return (
        <PropertyAutocomplete
          value={value}
          onChange={internalOnChange}
          id={props.id}
          size={size}
          mode={props.mode}
          readOnly={readOnly}
          autoFillProps={props.autoFillProps ?? true}
          allowClear={props.allowClear ?? true}
        />
      );
    case 'contextPropertyAutocomplete':
      return (
        <ContextPropertyAutocomplete
          {...{ ...props }}
          onValuesChange={internalOnChange}
          style={{}}
          readOnly={readOnly}
          defaultModelType="defaultType"
          id="contextPropertyAutocomplete"
          componentName={formData.componentName}
          propertyName={formData.propertyName}
          contextName={formData.context}
        />
      );
    case 'formAutocomplete':
      return (
        <FormAutocomplete
          readOnly={readOnly}
          size={props.size ?? 'small'}
          value={value}
          onChange={internalOnChange}
        />
      );
    case 'labelValueEditor':
      return <LabelValueEditor {...props} exposedVariables={codeEditorProps.exposedVariables} />;
    case 'permissions':
      return <PermissionAutocomplete value={value} readOnly={readOnly} onChange={internalOnChange} size={size} />;
    case 'multiColorPicker':
      return <MultiColorInput value={value} onChange={internalOnChange} readOnly={readOnly} propertyName={propertyName} />;
    case 'itemListConfiguratorModal':
      return (
        <ItemListConfiguratorModal
          readOnly={readOnly}
          initNewItem={onAddNewItem}
          value={value}
          onChange={internalOnChange}
          size={size}
          settingsMarkupFactory={() => {
            return {
              components: listItemSettingsMarkup,
              formSettings: {
                colon: false,
                layout: 'vertical' as FormLayout,
                labelCol: { span: 24 },
                wrapperCol: { span: 24 },
              },
            };
          }}
          itemRenderer={({ item }) => ({
            ...item,
            label: item.title || item.label || item.name,
            description: item.tooltip,
          })}
          buttonText={readOnly ? props.buttonTextReadOnly : props.buttonText}
          modalSettings={
            {
              title: readOnly ? props.modalReadonlySettings.title : props.modalSettings.title,
              header: <Alert message={readOnly ? props.modalReadonlySettings.header : props.modalSettings.header} />,
            }
          }
        />
      );
    case 'formTypeAutocomplete':
      return (
        <AutoComplete
          disabled={readOnly}
          options={formTypesOptions}
          size={size ?? 'small'}
          value={value}
          onChange={internalOnChange}
          onSearch={(t) =>
            setFormTypesOptions(
              (t
                ? formTypes.filter((f) => {
                  return f.toLowerCase().includes(t.toLowerCase());
                })
                : formTypes
              ).map((i) => {
                return { value: i };
              }),
            )}
        />
      );
    case 'configurableActionConfigurator':
      return <ConfigurableActionConfigurator value={value} onChange={internalOnChange} editorConfig={null} level={0} label={label} allowedActions={props.allowedActions} hideLabel={props.hideLabel} />;
    case 'typeAutoComplete':
      return (
        <Autocomplete
          dataSourceType="url"
          dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
          readOnly={readOnly}
          size={size}
          value={value}
          onChange={internalOnChange}
        />
      );
    case 'componentSelector':
      return (
        <FormComponentSelector
          componentType={componentType}
          noSelectionItem={
            noSelectionItemText ? { label: noSelectionItemText, value: noSelectionItemValue } : undefined
          }
          readOnly={readOnly}
          size={size}
          value={value}
          onChange={internalOnChange}
          propertyMeta={propertyMeta}
        />
      );
    case 'RefListItemSelectorSettingsModal':
      return <RefListItemSelectorSettingsModal {...props} onChange={(e) => onChange(e)} referenceList={referenceList} readOnly={false} />;

    case 'Password':
      return (
        <Password
          value={value || defaultValue}
          onChange={internalOnChange}
          size={size}
          readOnly={readOnly}
          variant={variant}
        />
      );
    default:
      return (
        <Input
          size={size}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          defaultValue={defaultValue}
          variant={variant}
          placeholder={placeholder}
          style={{ width: props.width ?? "100%" }}
          suffix={<span style={{ height: '20px' }}><Icon icon={icon} hint={tooltip} styles={styles} /></span>}
          value={value}
          type={textType}
        />
      );
  }
};

