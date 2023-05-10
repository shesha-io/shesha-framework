import { ReactNode, MutableRefObject } from 'react';
import {
  IConfigurableFormComponent,
  IFormComponentContainer,
  FormMarkup,
  IFlatComponentsStructure,
  IFormSettings,
} from '../providers/form/models';
import { ColProps, FormInstance } from 'antd';
import { InternalNamePath } from 'rc-field-form/lib/interface';
import { IPropertyMetadata } from './metadata';
import { ConfigurableFormInstance } from '../providers/form/contexts';
import { Migrator, MigratorFluent } from '../utils/fluentMigrator/migrator';
import { FormLayout } from 'antd/lib/form/Form';

export interface ISettingsFormInstance {
  submit: () => void;
  reset: () => void;
}

export interface IFormLayoutSettings {
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  layout?: FormLayout;
}

export interface ISettingsFormFactoryArgs<TModel = IConfigurableFormComponent> {
  readOnly: boolean;
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  toolboxComponent: IToolboxComponent;
  formRef?: MutableRefObject<ISettingsFormInstance | null>;
  propertyFilter?: (name: string) => boolean;
  layoutSettings?: IFormLayoutSettings;
}

export type ISettingsFormFactory<TModel = IConfigurableFormComponent> = (
  props: ISettingsFormFactoryArgs<TModel>
) => ReactNode;

export interface IToolboxComponent<T extends IConfigurableFormComponent = any> {
  /**
   * Type of the component. Must be unique in the project.
   */
  type: string;
  /**
   * If true, indicates that the component has data bindings and can be used as an input. Note: not all form components can be bound to the model (layout components etc.)
   */
  isInput?: boolean;
  /**
   * If true, indicates that the component has data bindings and can be used as an output.
   */
   isOutput?: boolean;
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
  factory?: (
    model: T,
    componentRef: MutableRefObject<any>,
    form: FormInstance<any>,
    children?: JSX.Element
  ) => ReactNode;
  /**
   * @deprecated - use `migrator` instead
   * Fills the component properties with some default values. Fired when the user drops a component to the form
   */
  initModel?: (model: T) => T;
  /**
   * Link component to a model metadata
   */
  linkToModelMetadata?: (model: T, metadata: IPropertyMetadata) => T;
  /**
   * Returns nested component containers. Is used in the complex components like tabs, panels etc.
   */
  getContainers?: (model: T) => IFormComponentContainer[];
  /**
   * Name of the child component containers. Note: may be changed in the future releases
   */
  customContainerNames?: string[];
  /**
   * Settings form factory. Renders the component settings form
   */
  settingsFormFactory?: ISettingsFormFactory<T>;
  /**
   * Markup of the settings form. Applied when the @settingsFormFactory is not specified, in this case you can render settings for in the designer itself
   */
  settingsFormMarkup?: FormMarkup;
  /**
   * Settings validator
   */
  validateSettings?: (model: T) => Promise<any>;

  /**
   * Return true to indicate that the data type is supported by the component
   */
  dataTypeSupported?: (dataTypeInfo: { dataType: string; dataFormat?: string }) => boolean;

  isTemplate?: boolean;
  build?: () => IConfigurableFormComponent[];

  /**
   * Settings migrations. Returns last version of settings
   */
  migrator?: SettingsMigrator<T>;
}

export interface SettingsMigrationContext {
  formSettings?: IFormSettings;
  flatStructure: IFlatComponentsStructure;
  componentId: string;
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
  components: IToolboxComponent[];
}

export interface IToolboxComponents {
  [key: string]: IToolboxComponent;
}

export { type IConfigurableFormComponent, type IFormComponentContainer };

export interface IFieldValidationErrors {
  name: InternalNamePath;
  errors: string[];
}

export { type ValidateErrorEntity } from 'rc-field-form/lib/interface';

export interface IAsyncValidationError {
  field: string;
  message: string;
}

export interface IFormValidationErrors { }

export { type ConfigurableFormInstance };

export interface IEditorAdapter<T extends IConfigurableFormComponent = IConfigurableFormComponent> {
  fillSettings: (customSettings: Partial<T>) => T;
  settingsFormFactory?: ISettingsFormFactory<T>;
};