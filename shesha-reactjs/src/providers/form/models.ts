import { ColProps } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { FormLayout } from 'antd/lib/form/Form';
import React, { CSSProperties, ReactNode } from 'react';
import { IAsyncValidationError, IDictionary } from '@/interfaces';
import { IKeyValue } from '@/interfaces/keyValue';
import { IHasVersion } from '@/utils/fluentMigrator/migrator';
import { ConfigurableItemFullName, ConfigurableItemIdentifier, ConfigurableItemUid } from '@/interfaces/configurableItems';
import { IFontValue } from '@/designer-components/_settings/utils/font/interfaces';
import { IBackgroundValue } from '@/designer-components/_settings/utils/background/interfaces';
import { IBorderValue } from '@/designer-components/_settings/utils/border/interfaces';
import { IDimensionsValue } from '@/designer-components/_settings/utils/dimensions/interfaces';
import { IShadowValue } from '@/designer-components/_settings/utils/shadow/interfaces';
import { isDefined } from '@/utils/nullables';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { IActionExecutionContext } from '@/interfaces/configurableAction';
import { GetAvailableConstantsFunc } from '@/components';

export const ROOT_COMPONENT_KEY: string = 'root'; // root key of the flat components structure
export const TOOLBOX_COMPONENT_DROPPABLE_KEY: string = 'toolboxComponent';
export const TOOLBOX_DATA_ITEM_DROPPABLE_KEY: string = 'toolboxDataItem';
export const SILENT_KEY: string = '_#@';

export interface ISubmitActionArguments {
  validateFields?: boolean;
}
export type ISubmitActionExecutionContext = IActionExecutionContext & {
  fieldsToValidate: string[] | undefined;
};

export type IValidateActionExecutionContext = IActionExecutionContext & {
  fieldsToValidate: string[] | undefined;
};

export type FormMode = 'designer' | 'edit' | 'readonly';

export type LabelAlign = 'left' | 'right';

export type PropertySettingMode = 'value' | 'code';

export interface IPropertySetting<Value = unknown> {
  _mode?: PropertySettingMode;
  _value?: Value;
  _code?: string;
  _lazy?: boolean;
}

export type ValueOrCodeEvaluator<Value = unknown> = Value | IPropertySetting<Value>;

export type SafeFunctionType = (...args: unknown[]) => unknown;

export type UnwrapCodeEvaluators<T> = T extends SafeFunctionType
  ? T
  : {
    [Key in keyof T]: T[Key] extends React.ReactNode | SafeFunctionType
      ? T[Key]
      : T[Key] extends ValueOrCodeEvaluator<infer Value>
        ? UnwrapCodeEvaluators<Value> // Recursively unwrap Value
        : T[Key] extends Record<string, unknown> // Check if it's a plain object
          ? UnwrapCodeEvaluators<T[Key]> // Recursively unwrap object
          : T[Key]; // Leave everything else
  };

export type FCUnwrapped<T> = React.FC<UnwrapCodeEvaluators<T>>;

/**
 * Component container
 */
export interface IFormComponentContainer {
  /** Unique Id of the component */
  id: string;
  /** Id of the parent component */
  parentId?: string | undefined;
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

export type EditMode = 'editable' | 'readOnly' | 'inherited' | 'default' | boolean;
export type PositionType = 'relative' | 'fixed';
export interface IStyleType {
  border?: IBorderValue | undefined;
  background?: IBackgroundValue | undefined;
  font?: IFontValue | undefined;
  shadow?: IShadowValue | undefined;
  menuItemShadow?: IShadowValue | undefined;
  dimensions?: IDimensionsValue | undefined;
  size?: SizeType | undefined;
  style?: string | undefined;
  stylingBox?: string | undefined;
  primaryTextColor?: string | undefined;
  primaryBgColor?: string | undefined;
  secondaryBgColor?: string | undefined;
  secondaryTextColor?: string | undefined;
  overflow?: boolean | "dropdown" | "menu" | "scroll" | "auto"; // TODO V1: check and fix values, it look slike a mix of css and component specific values
  hideScrollBar?: boolean;
  autoWidth?: boolean;
  autoHeight?: boolean;
}

export interface IInputStyles extends IStyleType {
  borderSize?: string | number;
  borderRadius?: string | number;
  borderType?: string;
  borderStyle?: string;
  borderWidth?: string | number;
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
  enableStyleOnReadonly?: boolean | undefined;
  container?: IStyleType | undefined;
};

export type ConfigurableFormComponentTypes =
  | 'alert' |
  'address' |
  'toolbar' |
  'dropdown' |
  'textField' |
  'textField' |
  'textArea' |
  'iconPicker' |
  'colorPicker' |
  'container' |
  'collapsiblePanel' |
  'autocomplete' |
  'checkbox' |
  'numberField' |
  'sectionSeparator' |
  'queryBuilder' |
  'labelValueEditor';

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
  settingsValidationErrors?: IAsyncValidationError[] | undefined;

  /** Custom onBlur handler */
  onBlurCustom?: string | undefined;

  /** Custom onChange handler */
  onChangeCustom?: string | undefined;

  /** Custom onClick handler */
  onClickCustom?: string;

  /** Custom onFocus handler */
  onFocusCustom?: string | undefined;

  /** Custom onSelect handler */
  onSelectCustom?: string | undefined;
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
  hidden?: boolean | undefined;

  /** Visible field contains only the value from the component settings (set explicitly or calculated),
   * but does not reflect the actual visibility of the component.
   * It may also depend on the permissions and/or state of the parent container/form
   * Use `hidden` to get actual visible/hidden state of the component */
  visible?: boolean | undefined;

  /** Custom visibility code */
  /** @deprecated Use hidden in js mode instead */
  customVisibility?: string | undefined;
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
  /** Margin styles extracted from fullStyle for wrapper use */
  margins: CSSProperties;
}

/**
 * Base model of the configurable component
 */
export interface IConfigurableFormComponent<TDeviceStyles extends IInputStyles = IInputStyles>
  extends IFormComponentContainer,
  IHasVersion,
  IComponentBindingProps,
  IComponentLabelProps,
  IComponentVisibilityProps,
  IComponentRuntimeProps,
  IStyleType {
  /** Type of the component */
  type: string;

  /** Description of the field, is used for tooltips */
  description?: string;

  /** Validation rules */
  validate?: IComponentValidationRules;

  /** Whether the component is read-only */
  readOnly?: boolean | IPropertySetting<boolean> | undefined;

  /** Component edit/action mode */
  editMode?: EditMode;

  /** Custom visibility code */
  /** @deprecated Use disabled in js mode instead */
  customEnabled?: string | undefined;

  /** Control size */
  size?: SizeType;

  /** If true, indicates that component is rendered dynamically and some of rules (e.g. visibility) shouldn't be applied to this component */
  isDynamic?: boolean;

  /** If true, indicates that component should be wrapped by SettingComponent and use JS customization.
   *
   * If 'lazy', indicates that component should be wrapped by SettingComponent, but will be calculated inside component rendering
   */
  jsSetting?: boolean | 'lazy';

  /** Used for calculating available constants for the JS setting Code Editor */
  availableConstantsExpression?: string | GetAvailableConstantsFunc;

  subscribedEventNames?: string[];

  /** Default style CSS applied as expression */
  style?: string | undefined;

  /** Default css style applied as string */
  stylingBox?: string | undefined;

  wrapperStyle?: string;

  noDataText?: string;

  noDataIcon?: string;

  noDataSecondaryText?: string;

  permissions?: string[];

  _formFields?: string[];

  layout?: FormLayout;

  inputStyles?: IStyleType;

  desktop?: TDeviceStyles | undefined;

  tablet?: TDeviceStyles | undefined;

  mobile?: TDeviceStyles | undefined;

  allStyles?: IFormComponentStyles;

  enableStyleOnReadonly?: boolean | undefined;

  listType?: 'text' | 'thumbnail';

}

export const isConfigurableFormComponent = (component: unknown): component is IConfigurableFormComponent =>
  isDefined(component) && typeof (component) === "object" && ['id', 'type'].every((key) => (key in component && typeof component[key as keyof typeof component] === 'string'));

export interface IConfigurableFormComponentWithReadOnly extends Omit<IConfigurableFormComponent, 'editMode'> {
  /** Whether the component is read-only */
  readOnly?: boolean;
}

export interface IComponentsContainer {
  id: string;
  components: IConfigurableFormComponent[];
}

export type IObjectWithStringId = {
  id: string;
};
export const isObjectWithStringId = (obj: unknown): obj is IObjectWithStringId => isDefined(obj) && typeof (obj) === "object" && "id" in obj && typeof (obj.id) === "string";

export const isComponentsContainer = (obj: unknown): obj is IComponentsContainer =>
  isDefined(obj) && "id" in obj && typeof (obj.id) === "string" && "components" in obj && Array.isArray(obj.components);

export type IRawComponentsContainer = IFormComponentContainer & {
  components: IConfigurableFormComponent[];
};
export const isRawComponentsContainer = (obj: unknown): obj is IRawComponentsContainer => isComponentsContainer(obj);

export interface IComponentsDictionary {
  [index: string]: IConfigurableFormComponent | IRawComponentsContainer;
}

export interface IComponentRelations {
  [index: string]: string[] | undefined;
}

export interface IFlatComponentsStructure {
  allComponents: IComponentsDictionary;
  componentRelations: IComponentRelations;
}
export const EMPTY_FLAT_COMPONENTS_STRUCTURE: IFlatComponentsStructure = { allComponents: {}, componentRelations: {} };

export interface IFormSettingsCommon {
  modelType?: IEntityTypeIdentifier | string | undefined;
  layout: FormLayout;
  colon: boolean;
  labelCol: ColProps;
  wrapperCol: ColProps;
  size?: SizeType | undefined;
  /** if true then need to update components structure for using Setting component */
  isSettingsForm?: boolean | undefined;
  permissions?: string[] | undefined;
  access?: number | undefined;
}

export interface ILegacyFormSettings extends IFormSettingsCommon {
  version?: -1 | 1 | null | undefined;
  fieldsToFetch?: string[] | undefined;
  excludeFormFieldsInPayload?: string | undefined;

  //#region urls
  postUrl?: string | undefined;
  putUrl?: string | undefined;
  deleteUrl?: string | undefined;
  getUrl?: string | undefined;
  //#endregion

  //#region lifecycle
  initialValues?: IKeyValue[] | undefined;
  preparedValues?: string | undefined;
  onInitialized?: string | undefined;
  onDataLoaded?: string | undefined;
  onUpdate?: string | undefined;
  //#endregion
}

export interface IFormLifecycleSettings {
  dataLoaderType?: string | undefined;
  dataLoadersSettings?: IDictionary<object> | undefined;
  dataSubmitterType?: string | undefined;
  dataSubmittersSettings?: IDictionary<object> | undefined;

  //#region lifecycle
  onBeforeDataLoad?: string | undefined;
  onAfterDataLoad?: string | undefined;

  onValuesUpdate?: string | undefined;

  onPrepareSubmitData?: string | undefined;
  onBeforeSubmit?: string | undefined;
  onSubmitSuccess?: string | undefined;
  onSubmitFailed?: string | undefined;
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

export interface FormMarkupWithSettings {
  formSettings: IFormSettings;
  components: IConfigurableFormComponent[];
}
export type FormRawMarkup = IConfigurableFormComponent[];
export type FormMarkup = FormRawMarkup | FormMarkupWithSettings;

export type FormFullName = ConfigurableItemFullName;
export type FormUid = ConfigurableItemUid;
export type FormIdentifier = ConfigurableItemIdentifier;

export interface IPersistedFormProps {
  id?: string | undefined;
  module?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  description?: string | undefined;
  markup?: FormRawMarkup | undefined;
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

export type FormAction = (values?: object, parameters?: object) => void;

export type FormSection = (data?: object) => ReactNode;

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
  id: string;
  /**
   * Form name
   */
  name: string;

  /**
   * Module
   */
  module: string;
  /**
   * Form label
   */
  label: string | null;
  /**
   * Description
   */
  description: string | null | undefined;
  /**
   * Form markup (components) in JSON format
   */
  markup: string | null;
  /**
   * Type of the form model
   */
  modelType: string | null;
  /**
   * Type
   */
  type?: string | null;
  access: number | null;
  permissions: string[] | null;
}

export interface IFormDto extends Omit<FormDto, 'markup'> {
  markup: FormRawMarkup | null;
  settings: IFormSettings | null;
  readOnly: boolean;
}

export interface IFormValidationRulesOptions<TData extends object = object> {
  formData?: TData;
  getFormData?: () => TData;
}

/** Default form settings */
export const DEFAULT_FORM_SETTINGS: IFormSettings = {
  layout: 'horizontal',
  colon: true,
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
  permissions: [],
};

export type ActionParametersJs = string;
export type ActionParametersDictionary = object;
export type ActionParameters = ActionParametersJs | ActionParametersDictionary;
export type ActionArguments = { [key: string]: unknown };
export type GenericDictionary = { [key: string]: unknown };

export const STYLE_BOX_CSS_POPERTIES = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const;
export type StyleBoxCssProperties = typeof STYLE_BOX_CSS_POPERTIES[number];
export type StyleBoxValue = Pick<CSSProperties, StyleBoxCssProperties>;

export interface IContainerConfig {
  dimensions?: IDimensionsValue;
  stylingBox?: string;
  style?: string;
}
export interface IComponentModelProps extends IConfigurableFormComponent {
  container?: IContainerConfig;
}
