import { IProviderSettingsFormFactory } from '@/designer-components/dynamicActionsConfigurator/interfaces';
import { FormMarkup } from '@/interfaces';
import { DynamicItemsEvaluationHook } from '@/providers/dynamicActionsDispatcher/models';
import { createNamedContext } from '@/utils/react';

export interface IDynamicActionsContext<TSettings extends object = object> {
  id: string;
  name: string;
  useEvaluator: DynamicItemsEvaluationHook;
  hasArguments: boolean;
  /**
   * Markup of the arguments editor. Applied when the @argumentsFormFactory is not specified, in this case you can render arguments for in the designer itself
   */
  settingsFormMarkup?: FormMarkup;// | FormMarkupFactory;
  /**
   * Settings form factory
   */
  settingsFormFactory?: IProviderSettingsFormFactory<TSettings>;// <TArguments>;
}

/** initial state */
export const DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE: IDynamicActionsContext = {
  id: null,
  name: 'unknown',
  useEvaluator: null,
  hasArguments: false,
};

export const DynamicActionsContext = createNamedContext<IDynamicActionsContext>(undefined, "DynamicActionsContext");
