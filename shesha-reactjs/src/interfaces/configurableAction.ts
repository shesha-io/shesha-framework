import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { ReactNode } from 'react';
import { FormMarkup, GenericDictionary } from '@/providers/form/models';
import { StandardNodeTypes } from './formComponent';
import { IObjectMetadata } from './metadata';
import { ActionParametersDictionary, IApplicationApi } from '@/providers';
import { IFormApi } from '@/providers/form/formApi';
import { Migrator, MigratorFluent } from '@/utils/fluentMigrator/migrator';
import { FormBuilderFactory } from '@/form-factory/interfaces';
import { isDefined } from '@/utils/nullables';
import { IArgumentsEvaluationContext } from '@/providers/configurableActionsDispatcher/contexts';

export interface IHasPreviousActionResponse {
  actionResponse?: unknown;
}
export interface IHasPreviousActionError {
  actionError?: unknown;
}

export type HasPreviousActionResult = IHasPreviousActionResponse | IHasPreviousActionError;

export type IActionExecutionContext = /* GenericDictionary &*/ HasPreviousActionResult & {
  form?: IFormApi | undefined;
  application?: IApplicationApi | undefined;
  data?: object | undefined;
};

export const hasPreviousActionError = (value: HasPreviousActionResult): value is IHasPreviousActionError => {
  return isDefined(value) && (value as IHasPreviousActionError).actionError !== undefined;
};

export const HasPreviousActionResponse = (value: HasPreviousActionResult): value is IHasPreviousActionResponse => {
  return isDefined(value) && (value as IHasPreviousActionResponse).actionResponse !== undefined;
};

/**
 * Configuration action executer
 */
export type IConfigurableActionExecuter<TArguments, TReponse, TExecutionContext extends IActionExecutionContext = IActionExecutionContext> = (
  actionArguments: TArguments,
  context: TExecutionContext,
) => Promise<TReponse>;

export interface ISettingsFormFactoryArgs<TModel extends object = object> {
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: Partial<TModel>, values: TModel) => void;
  readOnly?: boolean;
  exposedVariables?: ICodeExposedVariable[];
  availableConstants?: IObjectMetadata;
}

export interface FormMarkupFactoryArgs {
  exposedVariables?: ICodeExposedVariable[];
  availableConstants?: IObjectMetadata;
  fbf: FormBuilderFactory;
}
export type FormMarkupFactory = (factoryArgs: FormMarkupFactoryArgs) => FormMarkup;

export type IConfigurableActionArgumentsFormFactory<TModel extends object = object> = (
  props: ISettingsFormFactoryArgs<TModel>,
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

export type ConfigurableActionArgumentsMigrationContext = void;

/**
 * Arguments migrator
 */
export type ConfigurableActionArgumentsMigrator<TArguments> = (
  migrator: Migrator<TArguments, TArguments, ConfigurableActionArgumentsMigrationContext>,
) => MigratorFluent<TArguments, TArguments, ConfigurableActionArgumentsMigrationContext>;

/**
 * Configurable action descriptor. Is used to define consigurable actions
 */
export interface IConfigurableActionDescriptor<TArguments extends object = object, TReponse = unknown, TExecutionContext extends IActionExecutionContext = IActionExecutionContext>
  extends IConfigurableActionIdentifier {
  /**
   * User friendly name of the action. Action name is displayed if the label is not specified
   */
  label?: string | undefined;
  /**
   * Action description
   */
  description?: string | undefined;
  /**
   * Sort order for displaying actions in the list. Lower numbers appear first.
   */
  sortOrder?: number | undefined;
  /**
   * If true, indicaes that the action has configurable arguments
   */
  hasArguments: boolean;
  /**
   * Arguments form factory. Renders the action arguments editor
   */
  argumentsFormFactory?: IConfigurableActionArgumentsFormFactory<TArguments> | undefined;
  /**
   * Markup of the arguments editor. Applied when the @argumentsFormFactory is not specified, in this case you can render arguments for in the designer itself
   */
  argumentsFormMarkup?: FormMarkup | FormMarkupFactory | undefined;

  /**
   * Argument evaluation function. Default implementation is used when not specified
   */
  evaluateArguments?: ((argumentsConfiguration: TArguments, context: IArgumentsEvaluationContext) => Promise<TArguments | undefined>) | undefined;

  /**
   * Action executer
   */
  executer: IConfigurableActionExecuter<TArguments, TReponse, TExecutionContext>;

  useDynamicContextHook?: DynamicContextHook | undefined;

  /**
   * Arguments migrations. Returns last version of arguments
   */
  migrator?: ConfigurableActionArgumentsMigrator<TArguments> | undefined;
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

export const isConfigurableActionConfiguration = (actionConfig: unknown): actionConfig is IConfigurableActionConfiguration => {
  return isDefined(actionConfig) && typeof (actionConfig) === 'object' &&
    'actionOwner' in actionConfig && typeof (actionConfig.actionOwner) === 'string' &&
    'actionName' in actionConfig && typeof (actionConfig.actionName) === 'string';
};

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
