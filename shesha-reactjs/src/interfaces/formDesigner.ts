import { ColProps, FormInstance } from 'antd';
import { FormLayout } from 'antd/lib/form/Form';
import { InternalNamePath } from 'rc-field-form/lib/interface';
import { FC, MutableRefObject, ReactNode } from 'react';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import {
  FormMarkup,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormComponentContainer,
  IFormSettings,
} from '@/providers/form/models';
import { Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';
import { IModelMetadata, IPropertyMetadata } from './metadata';
import { IAjaxResponseBase, IApplicationContext, IErrorInfo } from '..';
import { ISheshaApplicationInstance } from '@/providers/sheshaApplication/application';
import { AxiosResponse } from 'axios';

export interface ISettingsFormInstance {
  submit: () => void;
  reset: () => void;
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

export interface ISettingsFormFactoryArgs<TModel = IConfigurableFormComponent> {
  readOnly: boolean;
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  toolboxComponent: IToolboxComponentBase;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
  isInModal?: boolean;
}

export type ISettingsFormFactory<TModel = IConfigurableFormComponent> = FC<ISettingsFormFactoryArgs<TModel>>;

export interface ComponentFactoryArguments<TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel = any> {
  model: TModel;
  children?: JSX.Element;
  calculatedModel?: TCalculatedModel;
  shaApplication?: ISheshaApplicationInstance;

  // for backward compatibility
  form: FormInstance;
}

export type FormFactory<TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel = any> = FC<ComponentFactoryArguments<TModel, TCalculatedModel>>;

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

export type IToolboxComponent<TModel extends IConfigurableFormComponent = IConfigurableFormComponent, TCalculatedModel = any> = {
/**
 * Type of the component. Must be unique in the project.
 */
  type: string;
  /**
   * Optional array of deprecated type names that this component replaces.
   * When specified, these deprecated types will automatically resolve to this component's type.
   * Example: replacesTypes: ['datatableContext'] means old 'datatableContext' components will resolve to this component.
   */
  replacesTypes?: string[];
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
   * Component factory. Renders the component according to the passed model (props)
   */
  Factory?: FormFactory<TModel, TCalculatedModel>;
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
  calculateModel?: (model: TModel, allData: IApplicationContext, useCalculatedModel?: TCalculatedModel) => TCalculatedModel;
  /**
   * @deprecated - use `migrator` instead
   * Fills the component properties with some default values. Fired when the user drops a component to the form
   */
  initModel?: (model: TModel) => TModel;
  /**
   * Link component to a model metadata
   */
  linkToModelMetadata?: (model: TModel, metadata: IPropertyMetadata) => TModel;
  /**
   * Returns nested component containers. Is used in the complex components like tabs, panels etc.
   */
  getContainers?: ((model: TModel) => IFormComponentContainer[]) | undefined;
  /**
   * Name of the child component containers. Note: may be changed in the future releases
   */
  customContainerNames?: string[] | undefined;
  /**
   * Settings form factory. Renders the component settings form
   */
  settingsFormFactory?: ISettingsFormFactory<TModel>;
  /**
   * Markup of the settings form. Applied when the @settingsFormFactory is not specified, in this case you can render settings for in the designer itself
   */
  settingsFormMarkup?: FormMarkup;
  /**
   * Settings validator
   */
  validateSettings?: ((model: TModel) => Promise<any>) | undefined;

  /**
   * Return true to indicate that the data type is supported by the component
   */
  dataTypeSupported?: (dataTypeInfo: { dataType: string; dataFormat?: string }) => boolean;

  /**
   * Settings migrations. Returns last version of settings
   */
  migrator?: SettingsMigrator<TModel>;

  /**
   * Returns fields to fetch, used when it is necessary to get additional fields, and not just what is specified in the propertyName field
   */
  getFieldsToFetch?: (propertyName: string, rawModel: TModel, metadata: IModelMetadata) => string[];

  /**
   * Validate model before rendering a component, used to add user-friendly messages about the need to correctly configure the component fields in the designer
   */
  validateModel?: (model: TModel, addModelError: (propertyName: string, error: string) => void) => void;

  /**
   * Returns true if the property should be calculated for the actual model (calculated from JS code)
   */
  actualModelPropertyFilter?: (name: string, value: any) => boolean;

  editorAdapter?: IEditorAdapter;
} & ToolboxComponentAsTemplate;

export type IToolboxComponentBase = IToolboxComponent;
// export type IToolboxComponentBase = IToolboxComponentGeneric<IConfigurableFormComponent>;
// export type IToolboxComponent<TModel extends IConfigurableFormComponent, TCalculatedModel = any> = IToolboxComponentBase & IToolboxComponentGeneric<TModel, TCalculatedModel>;


export interface SettingsMigrationContext {
  formSettings?: IFormSettings;
  flatStructure: IFlatComponentsStructure;
  componentId: string;
  isNew?: boolean;
}

/**
 * Settings migrator
 */
export type SettingsMigrator<TSettings> = (
  migrator: Migrator<IConfigurableFormComponent, TSettings, SettingsMigrationContext>
) => MigratorFluent<TSettings, TSettings, SettingsMigrationContext>;

export interface IToolboxComponentGroup {
  name: string;
  visible?: boolean;
  components: IToolboxComponentBase[];
}

export interface IToolboxComponents {
  [key: string]: IToolboxComponentBase;
}

export { type IConfigurableFormComponent as IConfigurableFormComponent, type IFormComponentContainer };

export interface IFieldValidationErrors {
  name: InternalNamePath;
  errors: string[];
}

export { type ValidateErrorEntity } from 'rc-field-form/lib/interface';

export interface IAsyncValidationError {
  field: string;
  message: string;
}

export type IFormValidationErrors = string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error;

export { type ConfigurableFormInstance };

export interface IComponentsContainerBaseProps {
  containerId: string;
  readOnly?: boolean;
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
