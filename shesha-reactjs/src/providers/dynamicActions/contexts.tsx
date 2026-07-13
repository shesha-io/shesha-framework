import { IProviderSettingsFormFactory } from '@/designer-components/dynamicActionsConfigurator/interfaces';
import { FormMarkup } from '@/interfaces';
import { DynamicItemsEvaluationHook } from '@/providers/dynamicActionsDispatcher/models';

export interface IDynamicActionsContextBase {
  id: string;
  name: string;
  hasArguments: boolean;
}

export interface IDynamicActionsContext<TSettings extends object = object> extends IDynamicActionsContextBase {
  useEvaluator: DynamicItemsEvaluationHook<TSettings>;
  /**
   * Markup of the arguments editor. Applied when the @argumentsFormFactory is not specified, in this case you can render arguments for in the designer itself
   */
  settingsFormMarkup?: FormMarkup | undefined;
  /**
   * Settings form factory
   */
  settingsFormFactory?: IProviderSettingsFormFactory<TSettings> | undefined;
}

export const isDynamicActionsContext = <TSettings extends object = object>(context: IDynamicActionsContextBase): context is IDynamicActionsContext<TSettings> => 'useEvaluator' in context;
