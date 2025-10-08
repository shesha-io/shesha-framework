import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { ReactNode } from 'react';
import { FormMarkup, GenericDictionary } from '@/providers/form/models';
import { StandardNodeTypes } from './formComponent';
import { IObjectMetadata } from './metadata';
import { ActionParametersDictionary, IApplicationApi } from '@/providers';
import { IFormApi } from '@/providers/form/formApi';
import { Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';

export interface IHasPreviousActionResponse {
  actionResponse?: any;
}
export interface IHasPreviousActionError {
  actionError?: any;
}

export type HasPreviousActionResult = IHasPreviousActionResponse | IHasPreviousActionError;

export type IActionExecutionContext = GenericDictionary & HasPreviousActionResult & {
  form?: IFormApi;
  application?: IApplicationApi;
};

export const hasPreviousActionError = (value: HasPreviousActionResult): value is IHasPreviousActionError => {
  return value && (value as IHasPreviousActionError).actionError !== undefined;
};

export const HasPreviousActionResponse = (value: HasPreviousActionResult): value is IHasPreviousActionResponse => {
  return value && (value as IHasPreviousActionResponse).actionResponse !== undefined;
};

/**
 * Configuration action executer
 */
export type IConfigurableActionExecuter<TArguments, TReponse> = (
  actionArguments: TArguments,
  context: IActionExecutionContext
) => Promise<TReponse>;

export interface ISettingsFormFactoryArgs<TModel extends object = object> {
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
  exposedVariables?: ICodeExposedVariable[];
  availableConstants?: IObjectMetadata;
}

export interface FormMarkupFactoryArgs {
  exposedVariables?: ICodeExposedVariable[];
  availableConstants?: IObjectMetadata;
}
export type FormMarkupFactory = (factoryArgs: FormMarkupFactoryArgs) => FormMarkup;

export type IConfigurableActionArgumentsFormFactory<TModel extends object = object> = (
  props: ISettingsFormFactoryArgs<TModel>
) => ReactNode;

export interface IHasActionOwner {
  /**
   * Action owner name (component responsible for the action execution)
   */
  owner: string;

  /**
   * Action owner Uid
   */
  ownerUid: string;
}

export interface IConfigurableActionIdentifier extends IHasActionOwner {
  /**
   * Action Name
   */
  name: string;
}

export type DynamicContextHook = () => GenericDictionary;
export const EMPTY_DYNAMIC_CONTEXT_HOOK: DynamicContextHook = () => ({});

export type ConfigurableActionArgumentsMigrationContext = never;

/**
 * Arguments migrator
 */
export type ConfigurableActionArgumentsMigrator<TArguments> = (
  migrator: Migrator<unknown, TArguments, ConfigurableActionArgumentsMigrationContext>
) => MigratorFluent<TArguments, TArguments, ConfigurableActionArgumentsMigrationContext>;

/**
 * Configurable action descriptor. Is used to define consigurable actions
 */
export interface IConfigurableActionDescriptor<TArguments extends object = object, TReponse = unknown>
  extends IConfigurableActionIdentifier {
  /**
   * User friendly name of the action. Action name is displayed if the label is not specified
   */
  label?: string;
  /**
   * Action description
   */
  description?: string;
  /**
   * If true, indicaes that the action has configurable arguments
   */
  hasArguments: boolean;
  /**
   * Arguments form factory. Renders the action arguments editor
   */
  argumentsFormFactory?: IConfigurableActionArgumentsFormFactory<TArguments>;
  /**
   * Markup of the arguments editor. Applied when the @argumentsFormFactory is not specified, in this case you can render arguments for in the designer itself
   */
  argumentsFormMarkup?: FormMarkup | FormMarkupFactory;

  /**
   * Argument evaluation function. Default implementation is used when not specified
   */
  evaluateArguments?: (argumentsConfiguration: TArguments, context: GenericDictionary) => Promise<TArguments>;

  /**
   * Action executer
   */
  executer: IConfigurableActionExecuter<TArguments, TReponse>;

  useDynamicContextHook?: DynamicContextHook;

  /**
   * Arguments migrations. Returns last version of arguments
   */
  migrator?: ConfigurableActionArgumentsMigrator<TArguments>;
}

export interface IMayHaveType {
  _type: string;
}

/**
 * Configurable action configuration. Is used in the form components to configure actions
 */
export interface IConfigurableActionConfiguration<TArguments extends ActionParametersDictionary = ActionParametersDictionary> extends IMayHaveType {
  actionOwner: string;
  actionName: string;
  version?: number;
  actionArguments?: TArguments;
  handleSuccess: boolean;
  onSuccess?: IConfigurableActionConfiguration;
  handleFail: boolean;
  onFail?: IConfigurableActionConfiguration;
}

/**
 * Make default action configuration, is used for component initialization
 */
export const makeDefaultActionConfiguration = (props: Pick<IConfigurableActionConfiguration, 'actionName' | 'actionOwner'>): IConfigurableActionConfiguration => {
  return {
    _type: StandardNodeTypes.ConfigurableActionConfig,
    actionName: props.actionName,
    actionOwner: props.actionOwner,
    handleFail: false,
    handleSuccess: false,
  };
};
