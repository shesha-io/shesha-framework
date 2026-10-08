import { ColProps } from 'antd';
import type { Rule } from 'antd/lib/form';
import { FormLayout } from 'antd/lib/form/Form';
import { FC, RefObject, ReactNode } from 'react';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import {
  FormFullName,
  FormIdentifier,
  FormMarkup,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormComponentContainer,
  IFormSettings,
} from '@/providers/form/models';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { IHasVersion, Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';
import { IModelMetadata, IPropertyMetadata } from './metadata';
import { FormMarkupFactory, FormMarkupFactoryArgs, IAjaxResponseBase, IApplicationContext, IErrorInfo, IFormValidationRulesOptions, IObjectMetadata, IShaFormInstance, IStyleValue, UnwrapCodeEvaluators } from '..';
import { ISheshaApplicationInstance } from '@/providers/sheshaApplication/application';
import { AxiosResponse } from 'axios';
import { UnwrapFunc } from '@/providers/form/utils/js-settings';
import { IActionDescriptorBase } from './configurableAction';
import { ISheshaErrorTypes } from '@/utils/errors';

export interface ISettingsFormInstance {
  submit: () => void;
  reset: () => void;
}

/**
 * Context of the fields calculation, is passed to the components that render nested forms
 */
export interface IGetFieldsToFetchContext {
  /**
   * Returns the list of fields required by the specified form. Fields are relative to the root of that form,
   * the caller is responsible for prefixing them with its own property name
   */
  getFormFieldsAsync: (formId: FormIdentifier) => Promise<string[]>;
  /**
   * Resolves the form configured for the given entity type and form type (view type). When the entity
   * has no such view configured the result is the convention-derived name `{entityName}-{formType}`,
   * which may point to a form that does not exist. Rejects only when the entity has no configuration at all
   */
  getEntityFormIdAsync: (entityType: string | IEntityTypeIdentifier, formType: string) => Promise<FormFullName>;
}

export interface IFormLayoutSettings {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  layout?: FormLayout;
}

export const DEFAULT_FORM_LAYOUT_SETTINGS: IFormLayoutSettings = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 },
};

export interface ISettingsFormFactoryArgs<TModel extends object = object> {
  readOnly: boolean;
  model: TModel;
  defaultConfig?: TModel | undefined;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: ((changedValues: Partial<TModel>, values: TModel) => void) | undefined;
  formRef?: RefObject<ISettingsFormInstance | null> | undefined;
  propertyFilter?: ((name: string) => boolean) | undefined;
  layoutSettings?: IFormLayoutSettings | undefined;
  isInModal?: boolean | undefined;
  availableConstants?: IObjectMetadata | undefined;
}

export type IComponentSettingsFormFactoryArgs<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> = ISettingsFormFactoryArgs<TModel> & {
  toolboxComponent?: IToolboxComponent<TModel> | undefined;
};

export type ISettingsFormFactory<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> = FC<ISettingsFormFactoryArgs<TModel>>;

export type IComponentSettingsFormFactory<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> = FC<IComponentSettingsFormFactoryArgs<TModel>>;

export type SettingsFormMarkupFactoryArgs = FormMarkupFactoryArgs & {
  removeStyleRouter?: boolean;
  /**
   * When true, style panels that are normally hidden/shown based on the component's own mode or
   * type (e.g. a dropdown's Tag Style panel, only shown when Display Style is Tags) are always
   * visible instead. Used by the theme editor's Component Defaults panel, where every style the
   * component can expose should be editable regardless of which mode happens to be selected.
   */
  forceVisible?: boolean;
};
export type SettingsFormMarkupFactory = FormMarkupFactory<SettingsFormMarkupFactoryArgs>;

export interface IApiContext<TModel> {
  updateApiModel: (value: Partial<TModel>) => void;
}

export interface ComponentFactoryArguments<TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel extends object = never> {
  model: UnwrapCodeEvaluators<TModel>;
  children?: React.JSX.Element;
  calculatedModel: TCalculatedModel;
  shaApplication?: ISheshaApplicationInstance;
  apiContext?: IApiContext<TModel>;
  form: IShaFormInstance;
}

export type FormFactory<TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel extends object = never> = FC<ComponentFactoryArguments<TModel, TCalculatedModel>>;

export type PropertyInclusionPredicate = (name: string) => boolean;

export interface IEditorAdapter {
  propertiesFilter: PropertyInclusionPredicate;
}

export type ToolboxComponentAsTemplate = {
  isTemplate: true;
  build: (allComponents: IToolboxComponents) => IConfigurableFormComponent[];
} | {
  isTemplate?: false;
  build?: never;
};

export type StyleGroups = 'common' | 'inputs' | 'common-containers' | 'buttons';

/**
 * The four component-group theme tabs (Input/Inline/Standard/Layout Components) a component
 * belongs to for theming purposes, set with its `themeGroup`. Components in the same tier
 * inherit shared group-level appearance defaults (see `IConfigurableTheme.componentGroups`).
 */
export type ThemeComponentGroup = 'input' | 'inline' | 'standard' | 'layout';

/**
 * Fallback for components without a `themeGroup`: the theme tab implied by their existing `styleGroup`.
 * `styleGroup` selects the script style API, so it is not set just for theming - use `themeGroup`.
 * 'standard' is the catch-all for components with neither.
 */
const THEME_GROUP_STYLE_GROUPS: Record<ThemeComponentGroup, ReadonlyArray<StyleGroups>> = {
  input: ['inputs'],
  inline: ['common'],
  layout: ['common-containers'],
  standard: ['buttons'],
};

/** The `ThemeComponentGroup` tab a component's `styleGroup` inherits its group-tier styles from. */
export const getThemeGroupForStyleGroup = (styleGroup: StyleGroups | undefined): ThemeComponentGroup => {
  if (styleGroup === undefined) return 'standard';
  const match = (Object.keys(THEME_GROUP_STYLE_GROUPS) as ThemeComponentGroup[])
    .find((group) => THEME_GROUP_STYLE_GROUPS[group].includes(styleGroup));
  return match ?? 'standard';
};

/**
 * The `ThemeComponentGroup` tab a component inherits its group-tier styles from: its `themeGroup`
 * when set, otherwise the tab implied by its `styleGroup` (see THEME_GROUP_STYLE_GROUPS).
 */
export const getThemeGroupForComponent = (component: Pick<IToolboxComponentBase, 'styleGroup' | 'themeGroup'> | undefined): ThemeComponentGroup =>
  component?.themeGroup ?? getThemeGroupForStyleGroup(component?.styleGroup);

export type IToolboxComponentBase = {
  /** Show the component in the theme editor (true by default) */
  showInThemeEditor?: boolean | undefined;

  /** Groupping components by style. Also selects the style API exposed to scripts (see formComponentApi). */
  styleGroup?: StyleGroups | undefined;

  /**
   * Theme tab (Input/Inline/Standard/Layout Components) whose group styles this component inherits.
   * Use this - not `styleGroup`, which also selects the script style API - to place a component in a
   * theme tab. Falls back to the tab implied by an existing `styleGroup`, else 'standard'.
   */
  themeGroup?: ThemeComponentGroup | undefined;

  // ToDo: AS - remove after all components are migrated to inheritance
  /**
   * If true, indicates that the component properties can be inherited
   */
  allowInherit?: boolean;

  /**
   * Type of the component. Must be unique in the project.
   */
  type: string;
  /**
   * If true, indicates that the component has data bindings and can be used as an input. Note: not all form components can be bound to the model (layout components etc.)
   */
  isInput: boolean;
  /**
   * If true, indicates that the component has data bindings and can be used as an output.
   */
  isOutput?: boolean;

  /**
   * If true, indicates that the component can be used as a setting component with JS customization
   */
  canBeJsSetting?: boolean;

  /**
   * Component name. This name is displayed on the components toolbox
   */
  name: string;
  /**
   * Icon that is displayed on the components toolbox
   */
  icon: ReactNode;

  tooltip?: ReactNode;
  /**
   * If true, indicates that the component should not be displayed on the components toolbox
   */
  isHidden?: boolean;
  /**
   * Name of the child component containers. Note: may be changed in the future releases
   */
  customContainerNames?: string[] | undefined;
  /**
   * Markup of the settings form. Applied when the @settingsFormFactory is not specified, in this case you can render settings for in the designer itself
   */
  settingsFormMarkup?: FormMarkup | SettingsFormMarkupFactory | undefined;
  /**
   * Return true to indicate that the data type is supported by the component
   */
  dataTypeSupported?: (dataTypeInfo: { dataType: string; dataFormat: string | undefined }) => boolean;

  editorAdapter?: IEditorAdapter;

  /**
   * @deprecated Will be removed after migrate all components to use new styles
   *
   * Controls dimension preservation in designer mode.
   * - `true`: Preserve all original dimensions (width, height, min/max)
   * - `false` or `undefined`: Fill 100% of wrapper (default behavior)
   * - Array of dimension names: Preserve only specified dimensions (e.g., ['height'] preserves only height)
   *
   * Use this for components that need to preserve specific dimensions in designer mode,
   * such as textArea which typically needs to preserve height while filling width.
   *
   * @example
   * ```typescript
   * preserveDimensionsInDesigner: true,        // Preserve all dimensions
   * preserveDimensionsInDesigner: ['height'],  // Preserve only height
   * preserveDimensionsInDesigner: ['width', 'height'], // Preserve width and height
   * ```
   */
  preserveDimensionsInDesigner?: boolean | Array<'width' | 'height' | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'>;
};

export interface IWrapperStyle {
  style?: IStyleValue | undefined;
  designerStyle?: IStyleValue | undefined;
}

export type ComponentValidator<TModel extends IConfigurableFormComponent = IConfigurableFormComponent> = (model: TModel) => Promise<unknown>;

export type ComplexValidationRules = Record<string, Rule[]>;

export type IMayHaveConfigurableActions = {
  actions?: IActionDescriptorBase[];
};

export type IToolboxComponent<TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel extends object = never> = IToolboxComponentBase &
  IMayHaveConfigurableActions & {
  /**
   * Component factory. Renders the component according to the passed model (props)
   */
    Factory: FormFactory<TModel, TCalculatedModel>;
    /**
     * A Hook for calculating component-specific values (executed before calculateModel)
     * @param model - component model
     * @param allData - application context
     * @returns - calculated model
     */
    useCalculateModel?: (model: TModel, allData: IApplicationContext) => TCalculatedModel;
    /**
     * A method for calculating component-specific values
     * @param useCalculatedModel - model calculated in useCalculateModel method (Hook)
     * @param model - component model
     * @param allData - application context
     * @returns - calculated model
     */
    calculateModel?: ((model: TModel, allData: IApplicationContext, useCalculatedModel?: TCalculatedModel) => TCalculatedModel) | undefined;

    /**
     * Returns true if the property should be calculated for the actual model (calculated from JS code)
     */
    actualModelPropertyFilter?: (name: string, value: unknown) => boolean;

    actualModelFilteredPropertyProcessor?: UnwrapFunc;

    /**
     * Fills the component properties with some default values. Fired when the user drops a component to the form
     */
    initModel?: (model: TModel) => TModel;
    /**
     * Returns default component styles
     */
    getDefaultStyles?: (model?: TModel) => IStyleValue;
    /**
     * Link component to a model metadata
     */
    linkToModelMetadata?: (model: TModel, metadata: IPropertyMetadata) => TModel;
    /**
     * Init model from metadata. Fired when the user drops a component to the form and bind component to the Entity property
     * @param currentModel - current component model
     * @param newModel - new component model
     * @param metadata - property metadata
     * @returns - component model
     */
    initModelFromMetadata?: (currentModel: TModel, newModel: TModel, metadata: IPropertyMetadata) => Promise<TModel>;
    /**
     * Returns nested component containers. Is used in the complex components like tabs, panels etc.
     */
    getContainers?: ((model: TModel) => IFormComponentContainer[]) | undefined;
    /**
     * Settings form factory. Renders the component settings form
     */
    settingsFormFactory?: IComponentSettingsFormFactory<TModel>;

    /**
     * Settings migrations. Returns last version of settings
     */
    migrator?: SettingsMigrator<TModel>;

    /**
     * Returns fields to fetch, used when it is necessary to get additional fields, and not just what is specified in the propertyName field
     */
    getFieldsToFetch?: ((propertyName: string, rawModel: TModel, metadata: IModelMetadata) => string[]) | undefined;

    /**
     * Asynchronous version of `getFieldsToFetch`, is used by the components that render nested forms and can't
     * calculate the list of fields without loading those forms. Takes precedence over `getFieldsToFetch`
     */
    getFieldsToFetchAsync?: ((propertyName: string, rawModel: TModel, metadata: IModelMetadata, context: IGetFieldsToFetchContext) => Promise<string[]>) | undefined;

    /**
     * Validate model before rendering a component, used to add user-friendly messages about the need to correctly configure the component fields in the designer
     */
    validateModel?: (model: TModel, addModelError: (propertyName: string, error: string) => void) => void;

    /**
     * If true, the standard validation rules will be used for component settings validation. Default: true
     */
    useStandardValidation?: boolean | undefined;
    /**
     * Returns additional Form.Item validation rules contributed by the component itself (e.g. intrinsic
     * value-format validity), merged with the generic rules built from `model.validate`
     */
    getExtraValidationRules?: <TValues = unknown>(model: TModel, context?: IFormValidationRulesOptions<TValues>) => Rule[] | ComplexValidationRules;

    /**
     * Configuration is used to show a preview of the component in the some places (like theme component configurator)
     */
    previewConfiguration?: TModel;

    /** Drag handle dimensions */
    getWrapperStyle?: ((model: TModel) => IWrapperStyle | undefined) | undefined;
  } & ToolboxComponentAsTemplate;

export type ComponentDefinition<TType extends string = string, TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel extends object = object> =
  Omit<IToolboxComponent<TModel, TCalculatedModel>, 'type'> & {
    type: TType;
  } & ToolboxComponentAsTemplate;

export interface SettingsMigrationContext {
  formSettings?: IFormSettings | undefined;
  flatStructure: IFlatComponentsStructure;
  componentId: string;
  isNew?: boolean | undefined;
}

/**
 * Settings migrator
 */
export type SettingsMigrator<TSettings extends IHasVersion = IHasVersion> = (
  migrator: Migrator<IConfigurableFormComponent, TSettings, SettingsMigrationContext>,
) => MigratorFluent<TSettings, TSettings, SettingsMigrationContext>;

export interface IToolboxComponentGroup {
  name: string;
  visible?: boolean;
  components: IToolboxComponent[];
}

export interface IToolboxComponents {
  [key: string]: IToolboxComponent;
}

export { type IConfigurableFormComponent as IConfigurableFormComponent, type IFormComponentContainer };

export interface IAsyncValidationError {
  field: string;
  fieldLabel?: string | ReactNode;
  message: string;
  path?: ValidationNodeRef[];
}

export interface ValidationNodeRef {
  kind: 'form-settings' | 'form-markup' | 'component' | 'setting';
  /** index among siblings; ignored for the form node */
  index?: number;
  /** stable component id, if any */
  id?: string;
  name: string;
  /** human readable label, e.g. "Email field" */
  label?: string | undefined;
}

export interface FieldValidationError {
  severity: ISheshaErrorTypes;
  /** Address of the settings owner. Must be non-empty. */
  path: ValidationNodeRef[];
  code?: string | undefined;

  propertyName: string;
  propertyLabel?: string | ReactNode;
  message: string;
}

export type IFormValidationErrors = string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error;

export { type ConfigurableFormInstance };

export interface IComponentsContainerBaseProps {
  containerId: string;
  readOnly?: boolean | undefined;
}

export type YesNoInherit = 'yes' | 'no' | 'inherit';

type ModelType = {
  name: string;
};
type BaseType<TModel extends ModelType = ModelType> = {
  method: (mode: TModel) => string;
};

type CustomModel = ModelType & {

};
type CustomType = BaseType<CustomModel>;

const customItem: CustomType = {
  method: function (_mode: CustomModel): string {
    throw new Error("Function not implemented.");
  },
};
export const items: BaseType[] = [customItem];
