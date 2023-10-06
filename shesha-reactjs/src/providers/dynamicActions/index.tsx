import React, { FC, useContext, PropsWithChildren } from 'react';
import metadataReducer from './reducer';
import {
  DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
  IDynamicActionsStateContext,
  IDynamicActionsActionsContext,
  IDynamicActionsContext,
  DynamicActionsContext,
} from './contexts';
import useThunkReducer from '../../hooks/thunkReducer';
import { useDynamicActionsDispatcher } from '../dynamicActionsDispatcher';
import { ButtonGroupItemProps } from 'providers/buttonGroupConfigurator/models';
import { DynamicRenderingHoc } from 'providers/dynamicActionsDispatcher/models';

export interface IDynamicActionsProps {
  id?: string;
  name: string;
  renderingHoc: DynamicRenderingHoc;
}
export interface IHasActions {
  items: ButtonGroupItemProps[]; // todo: make a generic interface with minimal number of properties, ButtonGroupItemProps will implement/extend this interface
}

const DynamicActionsProvider: FC<PropsWithChildren<IDynamicActionsProps>> = ({ id, name, renderingHoc, children }) => {
  const initial: IDynamicActionsStateContext = {
    ...DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
    id,
    name,
    renderingHoc,
  };

  const [state/*, dispatch*/] = useThunkReducer(metadataReducer, initial);

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