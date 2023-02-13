import { ReactNode } from "react";
import { FormMarkup, GenericDictionary } from "../providers/form/models";

/**
 * Configuration action executer
 */
export type IConfigurableActionExecuter<TArguments, TReponse> = (actionArguments: TArguments, context: GenericDictionary) => Promise<TReponse>;

export interface IConfigurableActionArguments {

}

export interface ISettingsFormFactoryArgs<TModel = IConfigurableActionArguments> {
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
}

export type IConfigurableActionArgumentsFormFactory<TModel = IConfigurableActionArguments> = (
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

/**
 * Configurable action descriptor. Is used to define consigurable actions
 */
export interface IConfigurableActionDescriptor<TArguments = IConfigurableActionArguments, TReponse = any> extends IConfigurableActionIdentifier {
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
  argumentsFormMarkup?: FormMarkup;

  /**
   * Argument evaluation function. Default implementation is used when not specified
   */
  evaluateArguments?: (argumentsConfiguration: TArguments, context: GenericDictionary) => Promise<TArguments>;

  /**
   * Action executer
   */
  executer: IConfigurableActionExecuter<TArguments, TReponse>;
}

/**
 * Configurable action configuration. Is used in the form conponents to configure actions
 */
export interface IConfigurableActionConfiguration {
  actionOwner: string;
  actionName: string;
  actionArguments?: any;
  handleSuccess: boolean;
  onSuccess?: IConfigurableActionConfiguration;
  handleFail: boolean;
  onFail?: IConfigurableActionConfiguration;
}