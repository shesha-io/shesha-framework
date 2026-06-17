import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { CodeTemplateSettings, ResultType } from '@/components/codeEditor/models';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { EntityIdentifier, EntityTypeAutocompleteType } from '@/components/configurableItemAutocomplete/entityTypeAutocomplete';
import { EndpointsAutocompleteValue, EndpointSelectionMode, IHttpVerb } from '@/components/endpointsAutocomplete/endpointsAutocomplete';
import { ComponentSelectorValue, ComponentType } from '@/components/formComponentSelector';
import { ComponentDefinition, ConfigurableItemFullName, FormMarkup, IComponentLabelProps, IConfigurableFormComponent, IObjectMetadata, IPropertySetting, IReferenceListIdentifier, ValueOrCodeEvaluator } from '@/interfaces';
import { ISetFormDataPayload } from '@/providers/form/contexts';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { GetResultTypeFunc } from '../codeEditor/interfaces';
import { CodeLanguages } from '../codeEditor/types';
import { IConfigurableActionConfiguratorComponentProps } from '../configurableActionsConfigurator/interfaces';
import { IItemListConfiguratorModalProps } from '../itemListConfigurator/itemListConfiguratorModal';
import { ButtonGroupItemProps, EditMode, FormFullName, IConfigurableActionConfiguration } from '@/providers';
import { ISortingItem, IStoredFilter } from '@/providers/dataTable/interfaces';
import { ListItemWithId } from '@/components/listEditor/models';
import { ILayerFormModel } from '@/providers/layersProvider/models';
import { ColumnsItemProps } from '@/providers/datatableColumnsConfigurator/models';
import { ILabelValueItem } from '@/components/labelValueEditor/labelValueEditor';
import { isDefined } from '@/utils/nullables';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { IColumnProps } from '../columns/interfaces';
import { DateFieldValueType } from '../dateField/interfaces';
import { IDynamicActionsConfiguration } from '../dynamicActionsConfigurator/models';
import { KeyInfomationBarItemProps } from '../keyInformationBar/interfaces';
import { IRefListItemFormModel } from '@/components/refListSelectorDisplay/provider/models';
import { ISizableColumnProps } from '../sizableColumns/interfaces';

export interface IRadioOption {
  value: string | number;
  icon?: string | React.ReactNode;
  title?: string | undefined;
  hint?: string | undefined;
  disabled?: boolean | undefined;
}

export interface IDropdownOption {
  label: string | React.ReactNode;
  value: string | number | null;
  icon?: string | React.ReactNode;
}

export interface IHasModelType {
  modelType?: string | IEntityTypeIdentifier | undefined | IPropertySetting<string>;
}

// Base interface without type-specific properties
export interface ISettingsInputBase<TValue = unknown> extends IComponentLabelProps,
  Omit<IConfigurableFormComponent, 'id' | 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName' | 'hidden'> {
  id?: string | undefined;
  label: string | React.ReactNode;
  propertyName: string;
  readOnly?: ValueOrCodeEvaluator<boolean> | undefined;
  value?: TValue | undefined;
  onChange?: ((value: TValue | null) => void) | undefined;
  onChangeSetting?: ((value: unknown, data: unknown, setFormData: (data: ISetFormDataPayload) => void, tempData?: unknown) => unknown) | undefined;
  level?: number | undefined;
  tooltip?: string | undefined;
  hideLabel?: boolean | undefined;
  layout?: 'horizontal' | 'vertical' | undefined;
  style?: string | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;

  /** @deprecated Use `visible` instead (inversion of `hidden`) */
  hidden?: boolean | IPropertySetting<boolean> | undefined;
  visible?: boolean | undefined;
  visibleJs?: string | undefined;

  width?: string | number | undefined;
  inline?: boolean | undefined;
}

// Color Picker
export interface IColorPickerSettingsInputProps extends ISettingsInputBase {
  type: 'colorPicker';
  showText?: boolean | undefined;
}
export const isColorPickerProps = (value: ISettingsInputBase): value is IColorPickerSettingsInputProps => value.type === 'colorPicker';

// Dropdown
export interface IDropdownSettingsInputProps extends ISettingsInputBase {
  type: 'dropdown';
  dropdownOptions?: IDropdownOption[] | IPropertySetting<IDropdownOption[]> | undefined;
  allowClear?: boolean | undefined;
  allowSearch?: boolean | undefined;
  dropdownMode?: 'multiple' | 'tags' | undefined;
  noSelectionItemText?: string | undefined;
  noSelectionItemValue?: string | undefined;
  useRawValues?: boolean | undefined;
  showSearch?: boolean | undefined;
  variant?: 'borderless' | 'filled' | 'outlined' | undefined;
}
export const isDropdownProps = (value: ISettingsInputBase): value is IDropdownSettingsInputProps => value.type === 'dropdown';

// Custom Dropdown
export interface ICustomDropdownSettingsInputProps extends ISettingsInputBase<string> {
  type: 'customDropdown';
  dropdownOptions?: IDropdownOption[] | undefined;
  customDropdownMode?: 'single' | 'multiple' | undefined;
  allowClear?: boolean | undefined;
  allowSearch?: boolean | undefined;
  customTooltip?: string | undefined;
}

// Radio
export interface IRadioSettingsInputProps extends ISettingsInputBase {
  type: 'radio';
  buttonGroupOptions?: IRadioOption[] | IPropertySetting<IRadioOption[]> | undefined;
  allowDeselect?: boolean | undefined;
}
export const isRadioProps = (value: ISettingsInputBase): value is IRadioSettingsInputProps => value.type === 'radio';

// Switch
export interface ISwitchSettingsInputProps extends ISettingsInputBase<boolean> {
  type: 'switch';
  defaultChecked?: boolean | undefined;
}

export interface ISectionSeparatorSettingsInputProps extends ISettingsInputBase {
  type: 'sectionSeparator';
  title?: string | undefined;
  lineColor?: string | undefined;
  lineThickness?: number | undefined;
  lineWidth?: string | undefined;
  lineHeight?: string | undefined;
  titleMargin?: number | undefined;
  marginBottom?: string | number | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  fontSize?: string | number | undefined;
  lineType?: string | undefined;
}

// Number Field
export interface INumberFieldSettingsInputProps extends ISettingsInputBase<number | string | undefined> {
  type: 'numberField';
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  hasUnits?: boolean | undefined;
  icon?: string | React.ReactNode;
  variant?: 'borderless' | 'filled' | 'outlined' | undefined;
  // width?: string | number | undefined;
}

// Text Field
export interface ITextFieldSettingsInputProps extends ISettingsInputBase {
  type: 'textField';
  prefix?: string | undefined;
  suffix?: string | undefined;
  regExp?: string | undefined;
  textType?: string | undefined;

  // width?: string | number | undefined;
  variant?: 'borderless' | 'filled' | 'outlined' | undefined;
  icon?: string | React.ReactNode;
}

// Text Area
export interface ITextAreaSettingsInputProps extends ISettingsInputBase {
  type: 'textArea';
  autoSize?: boolean | undefined;
  allowClear?: boolean | undefined;
}

// Code Editor
export interface ICodeEditorSettingsInputProps extends ISettingsInputBase<string> {
  type: 'codeEditor';
  mode?: 'inline' | 'dialog' | undefined;
  language?: CodeLanguages | undefined;
  wrapInTemplate?: boolean | undefined;
  templateSettings?: CodeTemplateSettings | undefined;
  resultType?: ResultType | undefined;
  resultTypeExpression?: string | GetResultTypeFunc | undefined;
  availableConstantsExpression?: string | undefined;
  availableConstants?: IObjectMetadata | undefined;
  exposedVariables?: string[] | ICodeExposedVariable[] | undefined;
}


// Button
export interface IButtonSettingsInputProps extends ISettingsInputBase {
  type: 'button';
  buttonText?: string | undefined;
  buttonTextReadOnly?: string | undefined;
  icon?: string | React.ReactNode;
  iconAlt?: string | React.ReactNode;
  tooltipAlt?: string | undefined;
}

// Button Group Configurator
export interface IButtonGroupConfiguratorSettingsInputProps extends ISettingsInputBase<ButtonGroupItemProps[]> {
  type: 'buttonGroupConfigurator';
  buttonGroupOptions?: IRadioOption[] | undefined;
  buttonText?: string | undefined;
  buttonTextReadOnly?: string | undefined;
  title?: string | undefined;
}

// Editable Tag Group
export interface IEditableTagGroupSettingsInputProps extends ISettingsInputBase<string[]> {
  type: 'editableTagGroupProps';
}

// Dynamic Items Configurator
export interface IDynamicItemsConfiguratorSettingsInputProps<TSettings extends object = object> extends ISettingsInputBase<IDynamicActionsConfiguration<TSettings>> {
  type: 'dynamicItemsConfigurator';
  items?: [] | undefined;
  onAddNewItem?: IItemListConfiguratorModalProps<ListItemWithId>['initNewItem'] | undefined;
}

// Autocomplete variants
export interface IAutocompleteSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'autocomplete';
  dataSourceType?: AutocompleteDataSourceType | undefined;
  dataSourceUrl?: string | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  entityAutocompleteType?: EntityTypeAutocompleteType | undefined;
  filter?: JsonLogicFilter | undefined;
  displayPropName?: string | undefined;
  keyPropName?: string | undefined;
  fields?: string[] | undefined;
  useRawValues?: boolean | undefined;
  allowClear?: boolean | undefined;
  showSearch?: boolean | undefined;
  httpVerb?: string | undefined;
  availableHttpVerbs?: IHttpVerb[] | undefined;
}

export interface IEndpointsAutocompleteSettingsInputProps extends ISettingsInputBase<EndpointsAutocompleteValue> {
  type: 'endpointsAutocomplete';
  filter?: object | undefined;
  allowClear?: boolean | undefined;
  showSearch?: boolean | undefined;
  httpVerb?: string | undefined;
  availableHttpVerbs?: IHttpVerb[] | undefined;
  prefix?: string | undefined;
  mode?: EndpointSelectionMode | undefined;
}

export interface IReferenceListAutocompleteSettingsInputProps extends ISettingsInputBase<IReferenceListIdentifier> {
  type: 'referenceListAutocomplete';
  dataSourceType?: AutocompleteDataSourceType | undefined;
  dataSourceUrl?: string | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  entityAutocompleteType?: EntityTypeAutocompleteType | undefined;
  // +referenceList?: any;
  filter?: object | undefined;
  displayPropName?: string | undefined;
  keyPropName?: string | undefined;
  fields?: string[] | undefined;
  useRawValues?: boolean | undefined;
  allowClear?: boolean | undefined;
  showSearch?: boolean | undefined;
}

export interface IPropertyAutocompleteSettingsInputProps extends ISettingsInputBase<string | string[]>, IHasModelType {
  type: 'propertyAutocomplete';
  filter?: object | undefined;
  displayPropName?: string | undefined;
  keyPropName?: string | undefined;
  fields?: string[] | undefined;
  useRawValues?: boolean | undefined;
  allowClear?: boolean | undefined;
  showSearch?: boolean | undefined;
  autoFillProps?: boolean | undefined;
  propertyModelType?: string | IEntityTypeIdentifier | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
}

export interface IContextPropertyAutocompleteSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'contextPropertyAutocomplete';
  dataSourceType?: AutocompleteDataSourceType | undefined;
  dataSourceUrl?: string | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  entityAutocompleteType?: EntityTypeAutocompleteType | undefined;
  // +referenceList?: any;
  filter?: object | undefined;
  displayPropName?: string | undefined;
  keyPropName?: string | undefined;
  fields?: string[] | undefined;
  useRawValues?: boolean | undefined;
  allowClear?: boolean | undefined;
  showSearch?: boolean | undefined;
  httpVerb?: string | undefined;
  availableHttpVerbs?: IHttpVerb[] | undefined;
}

export interface IFormAutocompleteSettingsInputProps extends ISettingsInputBase<FormFullName> {
  type: 'formAutocomplete';
  filter?: object | undefined;
  displayPropName?: string | undefined;
  keyPropName?: string | undefined;
  fields?: string[] | undefined;
  allowClear?: boolean | undefined;
  showSearch?: boolean | undefined;
}

// Entity Type Autocomplete
export interface IEntityTypeAutocompleteSettingsInputProps extends ISettingsInputBase<EntityIdentifier> {
  type: 'entityTypeAutocomplete';
  entityAutocompleteType?: EntityTypeAutocompleteType | undefined;
}

// Form Type Autocomplete
export interface IFormTypeAutocompleteSettingsInputProps extends ISettingsInputBase {
  type: 'formTypeAutocomplete';
}

// Image Uploader
export interface IImageUploaderSettingsInputProps extends ISettingsInputBase<string> {
  type: 'imageUploader';
  fileName?: string | undefined;
}

// Icon Picker
export interface IIconPickerSettingsInputProps extends ISettingsInputBase<string> {
  type: 'iconPicker';
  iconSize?: number | undefined;
}

// Multi Color Picker
export interface IMultiColorPickerSettingsInputProps extends ISettingsInputBase<{ [key: string]: string | undefined }> {
  type: 'multiColorPicker';
}

// Columns Config
export interface IColumnsConfigSettingsInputProps extends ISettingsInputBase<ColumnsItemProps[]> {
  type: 'columnsConfig';
  parentComponentType?: string | undefined;
}

export interface ISizableColumnsConfigSettingsInputProps extends ISettingsInputBase<ISizableColumnProps[]> {
  type: 'sizableColumnsConfig';
}

// Columns List
export interface IColumnsListSettingsInputProps extends ISettingsInputBase<IColumnProps[]> {
  type: 'columnsList';
}

export interface IKeyInformationBarColumnsInputProps extends ISettingsInputBase<KeyInfomationBarItemProps[]> {
  type: 'keyInformationBarColumnsList';
}

// Label Value Editor
export interface BaseLabelValueEditorProps extends ISettingsInputBase<ILabelValueItem[]> {
  labelTitle?: string | undefined;
  labelName?: string | undefined;
  valueTitle?: string | undefined;
  valueName?: string | undefined;
  mode?: 'dialog' | 'inline' | undefined;
}
export interface ILabelValueEditorSettingsInputProps extends BaseLabelValueEditorProps {
  type: 'labelValueEditor';
}

export interface ICustomLabelValueEditorSettingsInputProps extends BaseLabelValueEditorProps {
  type: 'customLabelValueEditor';
  colorName?: string | undefined;
  iconName?: string | undefined;
  colorTitle?: string | undefined;
  iconTitle?: string | undefined;
  dropdownOptions?: IDropdownOption[] | undefined;
}

// Component Selector
export interface IComponentSelectorSettingsInputProps extends ISettingsInputBase<ComponentSelectorValue> {
  type: 'componentSelector';
  componentType?: ComponentType | undefined;
  parentComponentType?: string | undefined;
  propertyAccessor?: string | undefined;
  noSelectionItemText?: string | undefined;
  noSelectionItemValue?: string | undefined;
}

// Item List Configurator Modal
export interface IItemListConfiguratorModalSettingsInputProps<TItem extends ListItemWithId = ListItemWithId> extends ISettingsInputBase<TItem[]> {
  type: 'itemListConfiguratorModal';
  onAddNewItem: IItemListConfiguratorModalProps<TItem>['initNewItem'];
  listItemSettingsMarkup?: IConfigurableFormComponent[] | undefined;
  buttonText?: string | undefined;
  buttonTextReadOnly?: string | undefined;
  modalSettings?: IItemListConfiguratorModalProps<TItem>['modalSettings'] | undefined;
  modalReadonlySettings?: IItemListConfiguratorModalProps<TItem>['modalSettings'] | undefined;
  settings?: FormMarkup | undefined;
  settingsMarkupFactory?: FormMarkup | undefined;
}

// Data Sorting Editor
export interface IDataSortingEditorSettingsInputProps extends ISettingsInputBase<ISortingItem[]> {
  type: 'dataSortingEditor';
  maxItemsCount?: number | undefined;
  modelType: string | IPropertySetting<string>;
}

// Query Builder
export interface IQueryBuilderSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'queryBuilder';
  fields?: string[] | undefined;
  fieldsUnavailableHint?: string | undefined;
}

// Filters List
export interface IFiltersListSettingsInputProps extends ISettingsInputBase<IStoredFilter[]> {
  type: 'filtersList';
}

// Edit Mode Selector
export interface IEditModeSelectorSettingsInputProps extends ISettingsInputBase<EditMode> {
  type: 'editModeSelector';
}

// Three State Switch
export interface IThreeStateSwitchSettingsInputProps extends ISettingsInputBase<boolean> {
  type: 'threeStateSwitch';
}

// Permissions
export interface IPermissionsSettingsInputProps extends ISettingsInputBase<string[]> {
  type: 'permissions';
}

// Configurable Action Configurator
export interface IConfigurableActionConfiguratorSettingsInputProps extends ISettingsInputBase<IConfigurableActionConfiguration> {
  type: 'configurableActionConfigurator';
  editorConfig?: IConfigurableActionConfiguratorComponentProps | undefined;
  allowedActions?: string[] | undefined;
}

// Ref List Item Selector Settings Modal
export interface IRefListItemSelectorSettingsModalProps extends ISettingsInputBase<IRefListItemFormModel[]> {
  type: 'RefListItemSelectorSettingsModal';
  referenceList?: ValueOrCodeEvaluator<ConfigurableItemFullName> | undefined;
}

// Password
export interface IPasswordSettingsInputProps extends ISettingsInputBase<string> {
  type: 'Password';
  variant?: 'borderless' | 'filled' | 'outlined' | undefined;
}

// Date
export interface IDateSettingsInputProps extends ISettingsInputBase<DateFieldValueType> {
  type: 'date';
}

// Tooltip
export interface ITooltipSettingsInputProps extends ISettingsInputBase {
  type: 'tooltip';
  icon?: string | React.ReactNode;
}

// Layer Selector Settings Modal
export interface ILayerSelectorSettingsInputProps extends ISettingsInputBase<ILayerFormModel[]> {
  type: 'layerSelectorSettingsModal';
  settings?: FormMarkup | undefined;
}

// Common styling props that can be applied to multiple components
export interface ICommonStylingProps {
  variant?: 'borderless' | 'filled' | 'outlined' | undefined;
  size?: SizeType | undefined;
  width?: string | number | undefined;
  wrapperCol?: { span: number } | undefined;
}

// Union type of all settings input props
export type BaseInputProps =
  | IColorPickerSettingsInputProps |
  IDropdownSettingsInputProps |
  ICustomDropdownSettingsInputProps |
  IRadioSettingsInputProps |
  ISwitchSettingsInputProps |
  INumberFieldSettingsInputProps |
  ITextFieldSettingsInputProps |
  ITextAreaSettingsInputProps |
  ICodeEditorSettingsInputProps |
  IButtonSettingsInputProps |
  IButtonGroupConfiguratorSettingsInputProps |
  IEditableTagGroupSettingsInputProps |
  IDynamicItemsConfiguratorSettingsInputProps |
  IAutocompleteSettingsInputProps |
  IEntityTypeAutocompleteSettingsInputProps |
  IFormTypeAutocompleteSettingsInputProps |
  IImageUploaderSettingsInputProps |
  IIconPickerSettingsInputProps |
  IMultiColorPickerSettingsInputProps |
  IColumnsConfigSettingsInputProps |
  IColumnsListSettingsInputProps |
  ILabelValueEditorSettingsInputProps |
  IComponentSelectorSettingsInputProps |
  IItemListConfiguratorModalSettingsInputProps |
  IDataSortingEditorSettingsInputProps |
  IQueryBuilderSettingsInputProps |
  IFiltersListSettingsInputProps |
  IEditModeSelectorSettingsInputProps |
  IPermissionsSettingsInputProps |
  IConfigurableActionConfiguratorSettingsInputProps |
  IRefListItemSelectorSettingsModalProps |
  IPasswordSettingsInputProps |
  IDateSettingsInputProps |
  ITooltipSettingsInputProps |
  IEndpointsAutocompleteSettingsInputProps |
  IPropertyAutocompleteSettingsInputProps |
  IReferenceListAutocompleteSettingsInputProps |
  IFormAutocompleteSettingsInputProps |
  ICustomLabelValueEditorSettingsInputProps |
  IKeyInformationBarColumnsInputProps |
  ISizableColumnsConfigSettingsInputProps |
  ILayerSelectorSettingsInputProps |
  IThreeStateSwitchSettingsInputProps |
  ISectionSeparatorSettingsInputProps
;

export type InputTypes = BaseInputProps['type'];

export type ISettingsInputSettingsInputProps = {
  [K in InputTypes]: {
    type?: 'settingsInput' | undefined;
    inputType: K;
    // modelType?: string | IEntityTypeIdentifier | undefined;
    modelType?: string | IEntityTypeIdentifier | undefined | IPropertySetting<string>;
  } & Omit<Extract<BaseInputProps, { type: K }>, 'type'>;
}[InputTypes];

export type ISettingsInputProps = BaseInputProps | ISettingsInputSettingsInputProps;

export const isSettingsInputProps = (value: unknown): value is ISettingsInputSettingsInputProps => isDefined(value) && typeof (value) === 'object' && 'type' in value && value.type === 'settingsInput';

export const hasModelType = (value: unknown): value is IHasModelType => isDefined(value) && typeof (value) === 'object' && 'modelType' in value && (typeof (value.modelType) === 'string' || typeof (value.modelType) === 'object');

export type SettingsInputComponentProps = ISettingsInputProps & IConfigurableFormComponent & { type: 'settingsInput' };

export type SettingsInputDefinition = ComponentDefinition<"settingsInput", SettingsInputComponentProps>;
