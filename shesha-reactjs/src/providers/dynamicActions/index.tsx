import React, { useContext, PropsWithChildren } from 'react';
import metadataReducer from './reducer';
import {
  DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
  IDynamicActionsStateContext,
  IDynamicActionsActionsContext,
  IDynamicActionsContext,
  DynamicActionsContext,
} from './contexts';
import useThunkReducer from '@/hooks/thunkReducer';
import { useDynamicActionsDispatcher } from '@/providers/dynamicActionsDispatcher';
import { ButtonGroupItemProps } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from '@/providers/dynamicActionsDispatcher/models';
import { IProviderSettingsFormFactory } from '@/designer-components/dynamicActionsConfigurator/interfaces';
import { FormMarkup } from '@/interfaces';

export interface IDynamicActionsProps<TSettings> {
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

const DynamicActionsProvider = <TSettings = unknown>({ id, name, useEvaluator, children, hasArguments = false, settingsFormFactory, settingsFormMarkup }: PropsWithChildren<IDynamicActionsProps<TSettings>>) => {
  const initial: IDynamicActionsStateContext<TSettings> = {
    ...DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
    id,
    name,
    useEvaluator,
    hasArguments,
    settingsFormFactory,
    settingsFormMarkup,
  };

  const [state/* , dispatch*/] = useThunkReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { registerProvider } = useDynamicActionsDispatcher();

  const dynamicActions: IDynamicActionsActionsContext = {
    /* NEW_ACTION_GOES_HERE */
  };

  const contextValue: IDynamicActionsContext = { ...state, ...dynamicActions };
  registerProvider({ id, contextValue });

  return <DynamicActionsContext.Provider value={contextValue}>{children}</DynamicActionsContext.Provider>;
};

function useDynamicActions(require: boolean) {
  const context = useContext(DynamicActionsContext);

  if (context === undefined && require) {
    throw new Error('useDynamicActions must be used within a DynamicActions');
  }

  return context;
}

export { DynamicActionsProvider, useDynamicActions };
