import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { setCurrentNavigatorAction } from './actions';
import {
  IStackedNavigationActionsContext,
  IStackedNavigationStateContext,
  STACKED_NAVIGATION_CONTEXT_INITIAL_STATE,
  StackedNavigationActionsContext,
  StackedNavigationStateContext,
} from './contexts';
import { stakedNavigationReducer } from './reducer';

const StackedNavigationProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, dispatch] = useReducer(stakedNavigationReducer, STACKED_NAVIGATION_CONTEXT_INITIAL_STATE);

  const setCurrentNavigator = (navigator: string): void => {
    dispatch(setCurrentNavigatorAction(navigator));
  };

  return (
    <StackedNavigationStateContext.Provider value={state}>
      <StackedNavigationActionsContext.Provider value={{ setCurrentNavigator }}>
        {children}
      </StackedNavigationActionsContext.Provider>
    </StackedNavigationStateContext.Provider>
  );
};

function useStackedNavigationState(): IStackedNavigationStateContext {
  const context = useContext(StackedNavigationStateContext);

  if (context === undefined) {
    throw new Error('useStackedNavigationState must be used within a StackedNavigationProvider');
  }

  return context;
}

function useStackedNavigationActions(): IStackedNavigationActionsContext {
  const context = useContext(StackedNavigationActionsContext);

  if (context === undefined) {
    throw new Error('useStackedNavigationActions must be used within a StackedNavigationProvider');
  }

  return context;
}

function useStackedNavigation(): IStackedNavigationStateContext & IStackedNavigationActionsContext {
  return { ...useStackedNavigationState(), ...useStackedNavigationActions() };
}

export { StackedNavigationProvider, useStackedNavigation, useStackedNavigationActions, useStackedNavigationState };
