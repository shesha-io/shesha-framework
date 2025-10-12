import React, { useContext, PropsWithChildren, ReactElement, useState } from 'react';
import {
  DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
  IDynamicActionsContext,
  DynamicActionsContext,
} from './contexts';
import { useDynamicActionsDispatcher } from '@/providers/dynamicActionsDispatcher';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from '@/providers/dynamicActionsDispatcher/models';
import { IProviderSettingsFormFactory } from '@/designer-components/dynamicActionsConfigurator/interfaces';
import { FormMarkup } from '@/interfaces';

export interface IDynamicActionsProps<TSettings extends object = object> {
  id?: string;
  name: string;
  renderingHoc?: DynamicRenderingHoc;
  useEvaluator: DynamicItemsEvaluationHook;
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
  const [state] = useState<IDynamicActionsContext>(() => ({
    ...DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
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

  return <DynamicActionsContext.Provider value={state}>{children}</DynamicActionsContext.Provider>;
};

function useDynamicActions(require: boolean): IDynamicActionsContext | undefined {
  const context = useContext(DynamicActionsContext);

  if (context === undefined && require) {
    throw new Error('useDynamicActions must be used within a DynamicActions');
  }

  return context;
}

export { DynamicActionsProvider, useDynamicActions };
