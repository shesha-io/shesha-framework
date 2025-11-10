import { AutocompleteDataSourceType } from '@/components/autocomplete';
import { CodeLanguages } from '../codeEditor/types';
import { CodeTemplateSettings, ResultType } from '@/components/codeEditor/models';
import { FormMarkup, IComponentLabelProps, IConfigurableFormComponent, IObjectMetadata, IPropertySetting } from '@/index';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { IItemListConfiguratorModalProps } from '../itemListConfigurator/itemListConfiguratorModal';
import { ComponentType } from '@/components/formComponentSelector';
import { IConfigurableActionConfiguratorComponentProps } from '../configurableActionsConfigurator/interfaces';
import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { GetResultTypeFunc } from '../codeEditor/interfaces';
import { EndpointSelectionMode, IHttpVerb } from '@/components/endpointsAutocomplete/endpointsAutocomplete';
import { ISetFormDataPayload } from '@/providers/form/contexts';
import { EntityTypeAutocompleteType } from '@/components/configurableItemAutocomplete/entityTypeAutocomplete';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface IRadioOption {
  value: string | number;
  icon?: string | React.ReactNode;
  title?: string;
  hint?: string;
  disabled?: boolean;
}

export interface IDropdownOption {
  label: string | React.ReactNode;
  value: any;
  icon?: string | React.ReactNode;
}

export interface IHasModelType {
  modelType?: string | IEntityTypeIdentifier;
}

// Base interface without type-specific properties
export interface ISettingsInputBase extends IComponentLabelProps,
  Omit<IConfigurableFormComponent, 'id' | 'label' | 'layout' | 'readOnly' | 'style' | 'propertyName' | 'hidden'> {
  id?: string;
  label: string;
  propertyName: string;
  readOnly?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  onChangeSetting?: (value: any, data?: any, setFormData?: (data: ISetFormDataPayload) => void) => void;
  level?: number;
  tooltip?: string;
  hideLabel?: boolean;
  layout?: 'horizontal' | 'vertical';
  style?: string;
  placeholder?: string;
  className?: string;
  hidden?: boolean | IPropertySetting;

  width?: string | number;
  inline?: boolean;
}

// Color Picker
export interface IColorPickerSettingsInputProps extends ISettingsInputBase {
  type: 'colorPicker';
  showText?: boolean;
}
export const isColorPickerProps = (value: ISettingsInputBase): value is IColorPickerSettingsInputProps => value.type === 'colorPicker';

// Dropdown
export interface IDropdownSettingsInputProps extends ISettingsInputBase {
  type: 'dropdown';
  dropdownOptions?: IDropdownOption[];
  allowClear?: boolean;
  allowSearch?: boolean;
  dropdownMode?: 'multiple' | 'tags';
  noSelectionItemText?: string;
  noSelectionItemValue?: string;
  useRawValues?: boolean;
  showSearch?: boolean;
  // width?: string | number;
  variant?: 'borderless' | 'filled' | 'outlined';
}
export const isDropdownProps = (value: ISettingsInputBase): value is IDropdownSettingsInputProps => value.type === 'dropdown';

// Custom Dropdown
export interface ICustomDropdownSettingsInputProps extends ISettingsInputBase {
  type: 'customDropdown';
  dropdownOptions?: IDropdownOption[];
  customDropdownMode?: 'single' | 'multiple';
  allowClear?: boolean;
  allowSearch?: boolean;
  customTooltip?: string;
}
export const isCustomDropdownProps = (value: ISettingsInputBase): value is ICustomDropdownSettingsInputProps => value.type === 'customDropdown';

// Radio
export interface IRadioSettingsInputProps extends ISettingsInputBase {
  type: 'radio';
  buttonGroupOptions?: IRadioOption[];
}
export const isRadioProps = (value: ISettingsInputBase): value is IRadioSettingsInputProps => value.type === 'radio';

// Switch
export interface ISwitchSettingsInputProps extends ISettingsInputBase {
  type: 'switch';
}
export const isSwitchProps = (value: ISettingsInputBase): value is ISwitchSettingsInputProps => value.type === 'switch';

// Number Field
export interface INumberFieldSettingsInputProps extends ISettingsInputBase {
  type: 'numberField';
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  hasUnits?: boolean;
  icon?: string | React.ReactNode;
  variant?: 'borderless' | 'filled' | 'outlined';
  // width?: string | number;
}
export const isNumberFieldProps = (value: ISettingsInputBase): value is INumberFieldSettingsInputProps => value.type === 'numberField';

// Text Field
export interface ITextFieldSettingsInputProps extends ISettingsInputBase {
  type: 'textField';
  prefix?: string;
  suffix?: string;
  regExp?: string;
  textType?: string;

  // width?: string | number;
  variant?: 'borderless' | 'filled' | 'outlined';
  icon?: string | React.ReactNode;
}

// Text Area
export interface ITextAreaSettingsInputProps extends ISettingsInputBase {
  type: 'textArea';
  autoSize?: boolean;
  allowClear?: boolean;
}
export const isTextAreaProps = (value: ISettingsInputBase): value is ITextAreaSettingsInputProps => value.type === 'textArea';

// Code Editor
export interface ICodeEditorSettingsInputProps extends ISettingsInputBase {
  type: 'codeEditor';
  mode?: 'inline' | 'dialog';
  language?: CodeLanguages;
  wrapInTemplate?: boolean;
  templateSettings?: CodeTemplateSettings;
  resultType?: ResultType;
  resultTypeExpression?: string | GetResultTypeFunc;
  availableConstantsExpression?: string;
  availableConstants?: IObjectMetadata;
  exposedVariables?: string[] | ICodeExposedVariable[];
}
export const isCodeEditorProps = (value: ISettingsInputBase): value is ICodeEditorSettingsInputProps => value.type === 'codeEditor';

// Button
export interface IButtonSettingsInputProps extends ISettingsInputBase {
  type: 'button';
  buttonText?: string;
  buttonTextReadOnly?: string;
  icon?: string | React.ReactNode;
  iconAlt?: string | React.ReactNode;
  tooltipAlt?: string;
}
export const isButtonProps = (value: ISettingsInputBase): value is IButtonSettingsInputProps => value.type === 'button';

// Button Group Configurator
export interface IButtonGroupConfiguratorSettingsInputProps extends ISettingsInputBase {
  type: 'buttonGroupConfigurator';
  buttonGroupOptions?: IRadioOption[];
}
export const isButtonGroupConfiguratorProps = (value: ISettingsInputBase): value is IButtonGroupConfiguratorSettingsInputProps => value.type === 'buttonGroupConfigurator';

// Editable Tag Group
export interface IEditableTagGroupSettingsInputProps extends ISettingsInputBase {
  type: 'editableTagGroupProps';
}
export const isEditableTagGroupProps = (value: ISettingsInputBase): value is IEditableTagGroupSettingsInputProps => value.type === 'editableTagGroupProps';

// Dynamic Items Configurator
export interface IDynamicItemsConfiguratorSettingsInputProps extends ISettingsInputBase {
  type: 'dynamicItemsConfigurator';
  items?: [];
  onAddNewItem?: IItemListConfiguratorModalProps<any>['initNewItem'];
}
export const isDynamicItemsConfiguratorProps = (value: ISettingsInputBase): value is IDynamicItemsConfiguratorSettingsInputProps => value.type === 'dynamicItemsConfigurator';

// Autocomplete variants
export interface IAutocompleteSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'autocomplete';
  dataSourceType?: AutocompleteDataSourceType;
  dataSourceUrl?: string;
  entityType?: string | IEntityTypeIdentifier;
  entityAutocompleteType?: EntityTypeAutocompleteType;
  referenceList?: any;
  filter?: any;
  displayPropName?: string;
  keyPropName?: string;
  fields?: string[];
  useRawValues?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  httpVerb?: string;
  availableHttpVerbs?: IHttpVerb[];
}
export const isAutocompleteProps = (value: ISettingsInputBase): value is IAutocompleteSettingsInputProps => value.type === 'autocomplete';

export interface IEndpointsAutocompleteSettingsInputProps extends ISettingsInputBase {
  type: 'endpointsAutocomplete';
  filter?: any;
  allowClear?: boolean;
  showSearch?: boolean;
  httpVerb?: string;
  availableHttpVerbs?: IHttpVerb[];
  prefix?: string;
  mode?: EndpointSelectionMode;
}
export const isEndpointsAutocompleteProps = (value: ISettingsInputBase): value is IEndpointsAutocompleteSettingsInputProps => value.type === 'endpointsAutocomplete';

export interface IReferenceListAutocompleteSettingsInputProps extends ISettingsInputBase {
  type: 'referenceListAutocomplete';
  dataSourceType?: AutocompleteDataSourceType;
  dataSourceUrl?: string;
  entityType?: string | IEntityTypeIdentifier;
  entityAutocompleteType?: EntityTypeAutocompleteType;
  referenceList?: any;
  filter?: any;
  displayPropName?: string;
  keyPropName?: string;
  fields?: string[];
  useRawValues?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
}
export const isReferenceListAutocompleteProps = (value: ISettingsInputBase): value is IReferenceListAutocompleteSettingsInputProps => value.type === 'referenceListAutocomplete';

export interface IPropertyAutocompleteSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'propertyAutocomplete';
  filter?: any;
  displayPropName?: string;
  keyPropName?: string;
  fields?: string[];
  useRawValues?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  autoFillProps?: boolean;
  mode?: 'single' | 'multiple' | 'tags';
}
export const isPropertyAutocompleteProps = (value: ISettingsInputBase): value is IPropertyAutocompleteSettingsInputProps => value.type === 'propertyAutocomplete';

export interface IContextPropertyAutocompleteSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'contextPropertyAutocomplete';
  dataSourceType?: AutocompleteDataSourceType;
  dataSourceUrl?: string;
  entityType?: string | IEntityTypeIdentifier;
  entityAutocompleteType?: EntityTypeAutocompleteType;
  referenceList?: any;
  filter?: any;
  displayPropName?: string;
  keyPropName?: string;
  fields?: string[];
  useRawValues?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  httpVerb?: string;
  availableHttpVerbs?: IHttpVerb[];
}
export const isContextPropertyAutocompleteProps = (value: ISettingsInputBase): value is IContextPropertyAutocompleteSettingsInputProps => value.type === 'contextPropertyAutocomplete';

export interface IFormAutocompleteSettingsInputProps extends ISettingsInputBase {
  type: 'formAutocomplete';
  filter?: any;
  displayPropName?: string;
  keyPropName?: string;
  fields?: string[];
  allowClear?: boolean;
  showSearch?: boolean;
}
export const isFormAutocompleteProps = (value: ISettingsInputBase): value is IFormAutocompleteSettingsInputProps => value.type === 'formAutocomplete';

// Entity Type Autocomplete
export interface IEntityTypeAutocompleteSettingsInputProps extends ISettingsInputBase {
  type: 'entityTypeAutocomplete';
  entityAutocompleteType?: EntityTypeAutocompleteType;
}
export const isEntityTypeAutocompleteProps = (value: ISettingsInputBase): value is IEntityTypeAutocompleteSettingsInputProps => value.type === 'entityTypeAutocomplete';

// Form Type Autocomplete
export interface IFormTypeAutocompleteSettingsInputProps extends ISettingsInputBase {
  type: 'formTypeAutocomplete';
}
export const isFormTypeAutocompleteProps = (value: ISettingsInputBase): value is IFormTypeAutocompleteSettingsInputProps => value.type === 'formTypeAutocomplete';

// Image Uploader
export interface IImageUploaderSettingsInputProps extends ISettingsInputBase {
  type: 'imageUploader';
  fileName?: string;
}
export const isImageUploaderProps = (value: ISettingsInputBase): value is IImageUploaderSettingsInputProps => value.type === 'imageUploader';

// Icon Picker
export interface IIconPickerSettingsInputProps extends ISettingsInputBase {
  type: 'iconPicker';
  iconSize?: number;
}
export const isIconPickerProps = (value: ISettingsInputBase): value is IIconPickerSettingsInputProps => value.type === 'iconPicker';

// Multi Color Picker
export interface IMultiColorPickerSettingsInputProps extends ISettingsInputBase {
  type: 'multiColorPicker';
}
export const isMultiColorPickerProps = (value: ISettingsInputBase): value is IMultiColorPickerSettingsInputProps => value.type === 'multiColorPicker';

// Columns Config
export interface IColumnsConfigSettingsInputProps extends ISettingsInputBase {
  type: 'columnsConfig';
  parentComponentType?: string;
}
export const isColumnsConfigProps = (value: ISettingsInputBase): value is IColumnsConfigSettingsInputProps => value.type === 'columnsConfig';

export interface ISizableColumnsConfigSettingsInputProps extends ISettingsInputBase {
  type: 'sizableColumnsConfig';
}
export const isSizableColumnsConfigProps = (value: ISettingsInputBase): value is ISizableColumnsConfigSettingsInputProps => value.type === 'sizableColumnsConfig';

// Columns List
export interface IColumnsListSettingsInputProps extends ISettingsInputBase {
  type: 'columnsList';
}
export const isColumnsListProps = (value: ISettingsInputBase): value is IColumnsListSettingsInputProps => value.type === 'columnsList';

export interface IKeyInformationBarColumnsInputProps extends ISettingsInputBase {
  type: 'keyInformationBarColumnsList';
}
export const isKeyInformationBarColumnsProps = (value: ISettingsInputBase): value is IKeyInformationBarColumnsInputProps => value.type === 'keyInformationBarColumnsList';

// Label Value Editor
export interface BaseLabelValueEditorProps extends ISettingsInputBase {
  labelTitle?: string;
  labelName?: string;
  valueTitle?: string;
  valueName?: string;
  mode?: 'dialog' | 'inline';
}
export interface ILabelValueEditorSettingsInputProps extends BaseLabelValueEditorProps {
  type: 'labelValueEditor';
}
export const isLabelValueEditorProps = (value: ISettingsInputBase): value is ILabelValueEditorSettingsInputProps => value.type === 'labelValueEditor';

export interface ICustomLabelValueEditorSettingsInputProps extends BaseLabelValueEditorProps {
  type: 'customLabelValueEditor';
  colorName?: string;
  iconName?: string;
  colorTitle?: string;
  iconTitle?: string;
  dropdownOptions?: IDropdownOption[] | string;
}
export const isCustomLabelValueEditorProps = (value: ISettingsInputBase): value is ICustomLabelValueEditorSettingsInputProps => value.type === 'customLabelValueEditor';

// Component Selector
export interface IComponentSelectorSettingsInputProps extends ISettingsInputBase {
  type: 'componentSelector';
  componentType?: ComponentType;
  parentComponentType?: string;
  propertyAccessor?: string;
  noSelectionItemText?: string;
  noSelectionItemValue?: string;
}
export const isComponentSelectorProps = (value: ISettingsInputBase): value is IComponentSelectorSettingsInputProps => value.type === 'componentSelector';

// Item List Configurator Modal
export interface IItemListConfiguratorModalSettingsInputProps extends ISettingsInputBase {
  type: 'itemListConfiguratorModal';
  onAddNewItem?: IItemListConfiguratorModalProps<any>['initNewItem'];
  listItemSettingsMarkup?: IConfigurableFormComponent[];
  buttonText?: string;
  buttonTextReadOnly?: string;
  modalSettings?: IItemListConfiguratorModalProps<any>['modalSettings'];
  modalReadonlySettings?: IItemListConfiguratorModalProps<any>['modalSettings'];
  settings?: FormMarkup;
  settingsMarkupFactory?: FormMarkup;
}
export const isItemListConfiguratorModalProps = (value: ISettingsInputBase): value is IItemListConfiguratorModalSettingsInputProps => value.type === 'itemListConfiguratorModal';

// Data Sorting Editor
export interface IDataSortingEditorSettingsInputProps extends ISettingsInputBase {
  type: 'dataSortingEditor';
  maxItemsCount?: number;
  modelType: string;
}
export const isDataSortingEditorProps = (value: ISettingsInputBase): value is IDataSortingEditorSettingsInputProps => value.type === 'dataSortingEditor';

// Query Builder
export interface IQueryBuilderSettingsInputProps extends ISettingsInputBase, IHasModelType {
  type: 'queryBuilder';
  fields?: string[];
  fieldsUnavailableHint?: string;
  modelType?: string | IEntityTypeIdentifier;
}
export const isQueryBuilderProps = (value: ISettingsInputBase): value is IQueryBuilderSettingsInputProps => value.type === 'queryBuilder';

// Filters List
export interface IFiltersListSettingsInputProps extends ISettingsInputBase {
  type: 'filtersList';
}
export const isFiltersListProps = (value: ISettingsInputBase): value is IFiltersListSettingsInputProps => value.type === 'filtersList';

// Edit Mode Selector
export interface IEditModeSelectorSettingsInputProps extends ISettingsInputBase {
  type: 'editModeSelector';
}
export const isEditModeSelectorProps = (value: ISettingsInputBase): value is IEditModeSelectorSettingsInputProps => value.type === 'editModeSelector';

// Permissions
export interface IPermissionsSettingsInputProps extends ISettingsInputBase {
  type: 'permissions';
}
export const isPermissionsEditorProps = (value: ISettingsInputBase): value is IPermissionsSettingsInputProps => value.type === 'permissions';

// Configurable Action Configurator
export interface IConfigurableActionConfiguratorSettingsInputProps extends ISettingsInputBase {
  type: 'configurableActionConfigurator';
  editorConfig?: IConfigurableActionConfiguratorComponentProps;
  allowedActions?: string[];
}
export const isConfigurableActionConfiguratorProps = (value: ISettingsInputBase): value is IConfigurableActionConfiguratorSettingsInputProps => value.type === 'configurableActionConfigurator';

// Ref List Item Selector Settings Modal
export interface IRefListItemSelectorSettingsModalProps extends ISettingsInputBase {
  type: 'RefListItemSelectorSettingsModal';
  referenceList?: any;
}
export const isRefListItemSelectorSettingsModalProps = (value: ISettingsInputBase): value is IRefListItemSelectorSettingsModalProps => value.type === 'RefListItemSelectorSettingsModal';

// Password
export interface IPasswordSettingsInputProps extends ISettingsInputBase {
  type: 'Password';
  variant?: 'borderless' | 'filled' | 'outlined';
}
export const isPasswordProps = (value: ISettingsInputBase): value is IPasswordSettingsInputProps => value.type === 'Password';

// Date
export interface IDateSettingsInputProps extends ISettingsInputBase {
  type: 'date';
}
export const isDateProps = (value: ISettingsInputBase): value is IDateSettingsInputProps => value.type === 'date';

// Tooltip
export interface ITooltipSettingsInputProps extends ISettingsInputBase {
  type: 'tooltip';
  icon?: string | React.ReactNode;
}
export const isTooltipProps = (value: ISettingsInputBase): value is ITooltipSettingsInputProps => value.type === 'tooltip';

// Layer Selector Settings Modal
export interface ILayerSelectorSettingsInputProps extends ISettingsInputBase {
  type: 'layerSelectorSettingsModal';
  settings?: FormMarkup;
}

// Common styling props that can be applied to multiple components
export interface ICommonStylingProps {
  variant?: 'borderless' | 'filled' | 'outlined';
  size?: SizeType;
  width?: string | number;
  wrapperCol?: { span: number };
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
  ILayerSelectorSettingsInputProps;

export type InputTypes = BaseInputProps['type'];

export type ISettingsInputSettingsInputProps = {
  [K in InputTypes]: {
    type?: 'settingsInput';
    inputType: K;
    modelType?: string | IEntityTypeIdentifier;
  } & Omit<Extract<BaseInputProps, { type: K }>, 'type'>;
}[InputTypes];

export type ISettingsInputProps = BaseInputProps | ISettingsInputSettingsInputProps;

export const isSettingsInputProps = (value: unknown): value is ISettingsInputSettingsInputProps => typeof (value) === 'object' && 'type' in value && value.type === 'settingsInput';

export const hasModelType = (value: unknown): value is IHasModelType => typeof (value) === 'object' && 'modelType' in value && (typeof (value.modelType) === 'string' || typeof (value.modelType) === 'object');
