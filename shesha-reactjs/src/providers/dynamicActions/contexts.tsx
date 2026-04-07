import { IProviderSettingsFormFactory } from '@/designer-components/dynamicActionsConfigurator/interfaces';
import { FormMarkup } from '@/interfaces';
import { DynamicItemsEvaluationHook } from '@/providers/dynamicActionsDispatcher/models';

export interface IDynamicActionsContext<TSettings extends object = object> {
  id: string;
  name: string;
  useEvaluator: DynamicItemsEvaluationHook<TSettings>;
  hasArguments: boolean;
  /**
   * Markup of the arguments editor. Applied when the @argumentsFormFactory is not specified, in this case you can render arguments for in the designer itself
   */
  settingsFormMarkup?: FormMarkup | undefined;
  /**
   * Settings form factory
   */
  settingsFormFactory?: IProviderSettingsFormFactory<TSettings> | undefined;
}
