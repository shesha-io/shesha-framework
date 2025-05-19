import { ColProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { FormLayout } from 'antd/lib/form/Form';
import React, { CSSProperties, ReactNode } from 'react';
import { DesignerToolbarSettings, IAsyncValidationError, IDictionary } from '@/interfaces';
import { IKeyValue } from '@/interfaces/keyValue';
import { IHasVersion } from '@/utils/fluentMigrator/migrator';
import { nanoid } from '@/utils/uuid';
import { ConfigurableItemFullName, ConfigurableItemIdentifier, ConfigurableItemUid } from '@/interfaces/configurableItems';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IDimensionsValue } from '@/designer-components/_settings/utils/dimensions/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { ColorValueType } from 'antd/es/color-picker/interface';
export const ROOT_COMPONENT_KEY: string = 'root'; // root key of the flat components structure
export const TOOLBOX_COMPONENT_DROPPABLE_KEY: string = 'toolboxComponent';
export const TOOLBOX_DATA_ITEM_DROPPABLE_KEY: string = 'toolboxDataItem';
export const SILENT_KEY: string = '_#@';

export interface ISubmitActionArguments {
  validateFields?: boolean;
}

export const SubmitActionArgumentsMarkup = new DesignerToolbarSettings()
  .addCheckbox({ id: nanoid(), propertyName: 'validateFields', parentId: 'root', label: 'Validate fields', defaultValue: false })
  .toJson();

export type FormMode = 'designer' | 'edit' | 'readonly';

export type ViewType = 'details' | 'table' | 'form' | 'blank' | 'masterDetails' | 'menu' | 'dashboard';

export type LabelAlign = 'left' | 'right';

export type PropertySettingMode = 'value' | 'code';
/*
export enum PropertySettingMode {
  Value = 'value',
  Code = 'code'
}
*/
export interface IPropertySetting<Value = any> {
  _mode?: PropertySettingMode;
  _value?: Value;
  _code?: string;
}

/**
 * Component container
 */
export interface IFormComponentContainer {
  /** Unique Id of the component */
  id: string;
  /** Id of the parent component */
  parentId?: string;
}

export interface IComponentValidationRules {
  required?: boolean;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  message?: string;
  validator?: string;
}

export type EditMode = 'editable' | 'readOnly' | 'inherited' | boolean;
export type PositionType = 'relative' | 'fixed';
export interface IStyleType {
  border?: IBorderValue;
  background?: IBackgroundValue;
  font?: IFontValue;
  shadow?: IShadowValue;
  dimensions?: IDimensionsValue;
  size?: SizeType;
  style?: string;
  stylingBox?: string;
  primaryTextColor?: ColorValueType;
  primaryBgColor?: ColorValueType;
  secondaryBgColor?: ColorValueType;
  secondaryTextColor?: ColorValueType;
  overflow?: CSSProperties['overflow'];
  hideScrollBar?: boolean;
}

export interface IInputStyles extends IStyleType {
  borderSize?: string | number;
  borderRadius?: string | number;
  borderType?: string;
  borderColor?: string;
  fontColor?: string;
  color?: string;
  fontWeight?: string | number;
  fontSize?: string | number;
  stylingBox?: string;
  height?: string | number;
  width?: string | number;
  hideBorder?: boolean;
  backgroundColor?: string;
  backgroundPosition?: string;
  backgroundCover?: 'contain' | 'cover';
  backgroundRepeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y' | 'round';
  className?: string;
  wrapperStyle?: string;
  backgroundType?: 'image' | 'color';
  backgroundDataSource?: 'storedFileId' | 'base64' | 'url';
  backgroundUrl?: string;
  backgroundBase64?: string;
  backgroundStoredFileId?: string;
  style?: string;
};

export type ConfigurableFormComponentTypes =
  | 'alert'
  | 'address'
  | 'toolbar'
  | 'dropdown'
  | 'textField'
  | 'textField'
  | 'textArea'
  | 'iconPicker'
  | 'colorPicker'
  | 'container'
  | 'collapsiblePanel'
  | 'autocomplete'
  | 'checkbox'
  | 'numberField'
  | 'sectionSeparator'
  | 'queryBuilder'
  | 'labelValueEditor';

export interface IComponentLabelProps {
  /** The label for this field that will appear next to it. */
  label?: string | React.ReactNode;
  /** Hide label of the field */
  hideLabel?: boolean;

  /** Position of the label */
  labelAlign?: LabelAlign;
}

export interface IComponentRuntimeProps {
  /**/
  settingsValidationErrors?: IAsyncValidationError[];

  /** Custom onBlur handler */
  onBlurCustom?: string;

  /** Custom onChange handler */
  onChangeCustom?: string;

  /** Custom onClick handler */
  onClickCustom?: string;

  /** Custom onFocus handler */
  onFocusCustom?: string;
}

export interface IComponentBindingProps {
  /** component name */
  componentName?: string;

  /** property name */
  propertyName?: string;

  /** data context ID, empty for from data */
  context?: string;

  /** initial data context ID, empty for from data */
  initialContext?: string;
}

export interface IComponentVisibilityProps {
  /** Hidden field is still a part of the form but not visible on it */
  hidden?: boolean;

  /** Custom visibility code */
  /** @deprecated Use hidden in js mode instead */
  customVisibility?: string;
}

export interface IComponentMetadata {
  /** Injectable field from the data cell */
  injectedTableRow?: { [key in string]?: any };
  injectedDefaultValue?: any;
}

export interface IFormComponentStyles {
  stylingBoxAsCSS: CSSProperties;
  dimensionsStyles: CSSProperties;
  borderStyles: CSSProperties;
  fontStyles: CSSProperties;
  backgroundStyles: CSSProperties;
  shadowStyles: CSSProperties;
  overflowStyles: CSSProperties;
  /** Styles calculated from js style setting */
  jsStyle: CSSProperties;
  /** Styles assempled from stylingBoxAsCSS, dimensionsStyles, borderStyles, fontStyles, backgroundStyles, shadowStyles*/
  appearanceStyle: CSSProperties;
  /** Styles assempled from {...appearanceStyle, ...jsStyle} */
  fullStyle: CSSProperties;
}

/**
 * Base model of the configurable component
 */
export interface IConfigurableFormComponent
  extends IFormComponentContainer,
  IHasVersion,
  IComponentBindingProps,
  IComponentLabelProps,
  IComponentVisibilityProps,
  IComponentRuntimeProps,
  IComponentMetadata {
  /** Type of the component */
  type: string;

  /** Options added using the dialog*/
  queryParams?: any;

  /** Description of the field, is used for tooltips */
  description?: string;

  /** Validation rules */
  validate?: IComponentValidationRules;

  /** Whether the component is read-only */
  readOnly?: boolean;

  /** Component edit/action mode */
  editMode?: EditMode;

  /** Custom visibility code */
  /** @deprecated Use disabled in js mode instead */
  customEnabled?: string;

  /** Default value of the field */
  defaultValue?: any;

  /** Control size */
  size?: SizeType;

  /** If true, indicates that component is rendered dynamically and some of rules (e.g. visibility) shouldn't be applied to this component */
  isDynamic?: boolean;

  /** If true, indicates that component should be wrapped by SettingComponent and use JS customization  */
  jsSetting?: boolean;

  subscribedEventNames?: string[];

  /** Default style CSS applied as expression */
  style?: string;

  /** Default css style applied as string */
  stylingBox?: string;

  noDataText?: string;

  noDataIcon?: string;

  noDataSecondaryText?: string;

  permissions?: string[];

  layout?: FormLayout;

  inputStyles?: IStyleType;

  desktop?: any;

  tablet?: any;

  mobile?: any;

  allStyles?: IFormComponentStyles;
}

export interface IConfigurableFormComponentWithReadOnly extends Omit<IConfigurableFormComponent, 'editMode'> {
  /** Whether the component is read-only */
  readOnly?: boolean;
}

export interface IComponentsContainer {
  id: string;
  components: IConfigurableFormComponent[];
}

export interface IComponentsDictionary {
  [index: string]: IConfigurableFormComponent;
}

export interface IComponentRelations {
  [index: string]: string[];
}

export interface IFlatComponentsStructure {
  allComponents: IComponentsDictionary;
  componentRelations: IComponentRelations;
}

export interface IFormSettingsCommon {
  modelType?: string;
  layout: FormLayout;
  colon: boolean;
  labelCol: ColProps;
  wrapperCol: ColProps;
  size?: SizeType;
  /** if true then need to update components structure for using Setting component */
  isSettingsForm?: boolean;
  permissions?: string[];
  access?: number;
}

export interface ILegacyFormSettings extends IFormSettingsCommon {
  version?: -1 | 1 | null | undefined;
  fieldsToFetch?: string[];
  excludeFormFieldsInPayload?: string;

  //#region urls
  postUrl?: string;
  putUrl?: string;
  deleteUrl?: string;
  getUrl?: string;
  //#endregion

  //#region lifecycle
  initialValues?: IKeyValue[];
  preparedValues?: string; // replace with onBeforeSubmit(data: TData): TData
  onInitialized?: string;
  onDataLoaded?: string;
  onUpdate?: string;
  //#endregion 
}

export interface IFormLifecycleSettings {
  dataLoaderType?: string;
  dataLoadersSettings?: IDictionary<object>;
  dataSubmitterType?: string;
  dataSubmittersSettings?: IDictionary<object>;

  //#region lifecycle 
  onBeforeDataLoad?: string;
  onAfterDataLoad?: string;

  onValuesUpdate?: string;

  onPrepareSubmitData?: string;
  onBeforeSubmit?: string;
  onSubmitSuccess?: string;
  onSubmitFailed?: string;
  //#endregion lifecycle
}

export type IFormSettings = ILegacyFormSettings & IFormLifecycleSettings;

export interface IFormProps extends IFlatComponentsStructure {
  id?: string;
  module?: string;
  name?: string;
  label?: string;
  description?: string;
  formSettings: IFormSettings;
}

export declare type StoreValue = any;
export interface Store {
  [name: string]: StoreValue;
}

export interface FormMarkupWithSettings {
  formSettings: IFormSettings;
  components: IConfigurableFormComponent[];
}
export type FormRawMarkup = IConfigurableFormComponent[];
export type FormMarkup =
  | FormRawMarkup
  | FormMarkupWithSettings | ((data: any) => FormRawMarkup
    | FormMarkupWithSettings);

export type FormFullName = ConfigurableItemFullName;
export type FormUid = ConfigurableItemUid;
export type FormIdentifier = ConfigurableItemIdentifier;

export interface IPersistedFormProps {
  id?: string;
  module?: string;
  name?: string;
  label?: string;
  description?: string;
  markup?: FormRawMarkup;
  /**
   * Version number
   */
  versionNo?: number;
  /**
   * Version status
   */
  versionStatus?: number;

  /**
   * If true, indicates that it's the last version of the form
   */
  isLastVersion?: boolean;
}

type AllKeys<T> = T extends unknown ? keyof T : never;
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
type _ExclusifyUnion<T, K extends PropertyKey> =
  T extends unknown ? Id<T & Partial<Record<Exclude<K, keyof T>, never>>> : never;
type ExclusifyUnion<T> = _ExclusifyUnion<T, AllKeys<T>>;

export type HasFormId = {
  formId: FormIdentifier;
};
export type HasFormFlatMarkup = {
  formSettings: IFormSettings;
  flatStructure: IFlatComponentsStructure;
};
export type HasFormRawMarkup = {
  markup: FormMarkup;
  cacheKey?: string;
};

export type HasFormIdOrMarkup = ExclusifyUnion<HasFormId | HasFormFlatMarkup | HasFormRawMarkup>;

export type FormAction = (values?: any, parameters?: any) => void;

export type FormSection = (data?: any) => ReactNode;

export interface IFormActionDesc {
  url: string;
  params: any;
}

export interface IFormActions {
  [key: string]: FormAction;
}

export interface IFormSections {
  [key: string]: FormSection;
}

/**
 * Form DTO
 */
export interface FormDto {
  id?: string;
  /**
   * Form name
   */
  name?: string;

  /**
   * Module
   */
  module?: string;
  /**
   * Form label
   */
  label?: string | null;
  /**
   * Description
   */
  description?: string | null;
  /**
   * Form markup (components) in JSON format
   */
  markup?: string | null;
  /**
   * Type of the form model
   */
  modelType?: string | null;
  /**
   * Type
   */
  type?: string | null;

  versionNo?: number;
  versionStatus?: number;
  isLastVersion?: boolean;
}

export interface IFormDto extends Omit<FormDto, 'markup'> {
  markup: FormRawMarkup;
  settings: IFormSettings;
}

export interface IFormValidationRulesOptions {
  formData?: any;
  getFormData?: () => any;
}

/** Default form settings */
export const DEFAULT_FORM_SETTINGS: IFormSettings = {
  layout: 'horizontal',
  colon: true,
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
  permissions: []
};

export type ActionParametersJs = string;
export type ActionParametersDictionary = [{ key: string; value: string }];
export type ActionParameters = ActionParametersJs | ActionParametersDictionary;
export type ActionArguments = { [key: string]: any };
export type GenericDictionary = { [key: string]: any };