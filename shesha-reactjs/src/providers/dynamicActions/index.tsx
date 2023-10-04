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

export interface IDynamicActionsProps {
  id?: string;
}

const DynamicActionsProvider: FC<PropsWithChildren<IDynamicActionsProps>> = ({ id, children }) => {
  const initial: IDynamicActionsStateContext = {
    ...DYNAMIC_ACTIONS_CONTEXT_INITIAL_STATE,
    id,
  };

  const [state/*, dispatch*/] = useThunkReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { registerProvider } = useDynamicActionsDispatcher();

  const metadataActions: IDynamicActionsActionsContext = {
    /* NEW_ACTION_GOES_HERE */
    
  };

  const contextValue: IDynamicActionsContext = { ...state, ...metadataActions };
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