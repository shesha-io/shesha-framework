import React, { PropsWithChildren, ReactElement, useState } from 'react';
import {
  IDynamicActionsContext,
} from './contexts';
import { useDynamicActionsDispatcher } from '@/providers/dynamicActionsDispatcher';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from '@/providers/dynamicActionsDispatcher/models';
import { IProviderSettingsFormFactory } from '@/designer-components/dynamicActionsConfigurator/interfaces';
import { FormMarkup } from '@/interfaces';

export interface IDynamicActionsProps<TSettings extends object = object> {
  id: string;
  name: string;
  renderingHoc?: DynamicRenderingHoc;
  useEvaluator: DynamicItemsEvaluationHook<TSettings>;
  hasArguments?: boolean;
  /**
   * Settings form factory
   */
  settingsFormFactory?: IProviderSettingsFormFactory<TSettings>;
  settingsFormMarkup?: FormMarkup;// | FormMarkupFactory;
}
export interface IHasActions {
  items: ButtonGroupItemProps[]; // TODO: make a generic interface with minimal number of properties, ButtonGroupItemProps will implement/extend this interface
}

const DynamicActionsProvider = <TSettings extends object = object>({ id, name, useEvaluator, children, hasArguments = false, settingsFormFactory, settingsFormMarkup }: PropsWithChildren<IDynamicActionsProps<TSettings>>): ReactElement => {
  const [state] = useState<IDynamicActionsContext<TSettings>>(() => ({
    id,
    name,
    useEvaluator,
    hasArguments,
    settingsFormFactory,
    settingsFormMarkup,
  }));

  // register provider in the dispatcher if exists
  const { registerProvider } = useDynamicActionsDispatcher();

  registerProvider({ id, contextValue: state });

  return <>{children}</>;
};

export { DynamicActionsProvider };
