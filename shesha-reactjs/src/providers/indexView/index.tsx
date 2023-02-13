import React, { FC, useReducer, useContext, PropsWithChildren } from 'react';
import { indexViewReducer } from './reducer';
import { IndexViewActionsContext, IndexViewStateContext, INDEX_VIEW_CONTEXT_INITIAL_STATE } from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';

const IndexViewProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, dispatch] = useReducer(indexViewReducer, INDEX_VIEW_CONTEXT_INITIAL_STATE);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <IndexViewStateContext.Provider value={state}>
      <IndexViewActionsContext.Provider value={{ ...getFlagSetters(dispatch) /* NEW_ACTION_GOES_HERE */ }}>
        {children}
      </IndexViewActionsContext.Provider>
    </IndexViewStateContext.Provider>
  );
};

function useIndexViewState() {
  const context = useContext(IndexViewStateContext);

  if (context === undefined) {
    throw new Error('useIndexViewState must be used within a IndexViewProvider');
  }

  return context;
}

function useIndexViewActions() {
  const context = useContext(IndexViewActionsContext);

  if (context === undefined) {
    throw new Error('useIndexViewActions must be used within a IndexViewProvider');
  }

  return context;
}

function useIndexViewStore() {
  return { ...useIndexViewState(), ...useIndexViewActions() };
}

export { IndexViewProvider, useIndexViewState, useIndexViewActions, useIndexViewStore };
