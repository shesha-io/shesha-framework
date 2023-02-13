import React, { FC, useContext, PropsWithChildren, useEffect } from 'react';
//import metadataReducer from './reducer';
import {
  //METADATA_CONTEXT_INITIAL_STATE,
  IConfigurableActionsStateContext,
  IMetadataActionsContext,
  IMetadataContext,
  MetadataContext,
} from './contexts';
//import { setMetadataAction } from './actions';
import useThunkReducer from 'react-hook-thunk-reducer';
//import { useConfigurableActionsDispatcher } from '../../providers';
import { IConfigurableAction } from '../../utils/configurationFramework/models';

export interface IConfigurableActionsProviderProps {
  owner: string;
  actions: IConfigurableAction[];
}

const ConfigurableActionsProvider: FC<PropsWithChildren<IConfigurableActionsProviderProps>> = ({ owner, actions, children }) => {
  const initial: IConfigurableActionsStateContext = {
    owner, 
    actions,
  };

  //const [state, dispatch] = useThunkReducer(metadataReducer, initial);

  // register provider in the dispatcher if exists
  const { registerActions } = useConfigurableActionsDispatcher();

  const allActions: IMetadataActionsContext = {
    /* NEW_ACTION_GOES_HERE */
  };

  const contextValue: IMetadataContext = { ...state, ...metadataActions };
  registerActions({ id, modelType, contextValue });

  return <MetadataContext.Provider value={contextValue}>{children}</MetadataContext.Provider>;
};

function useConfigurableActions(require: boolean) {
  const context = useContext(MetadataContext);

  if (context === undefined && require) {
    throw new Error('useConfigurableActions must be used within a ConfigurableActionsProvider');
  }

  return context;
}

export { ConfigurableActionsProvider, useConfigurableActions };
