import React, { FC, PropsWithChildren, useContext, useReducer } from 'react';
import { setCurrentNavigatorAction } from './actions';
import {
  StackedNavigationActionsContext,
  StackedNavigationStateContext,
  STACKED_NAVIGATION_CONTEXT_INITIAL_STATE,
} from './contexts';
import { stakedNavigationReducer } from './reducer';

const StackedNavigationProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const [state, dispatch] = useReducer(stakedNavigationReducer, STACKED_NAVIGATION_CONTEXT_INITIAL_STATE);

  const setCurrentNavigator = (navigator: string) => {
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

function useStackedNavigationState() {
  const context = useContext(StackedNavigationStateContext);

  if (context === undefined) {
    throw new Error('useStackedNavigationState must be used within a StackedNavigationProvider');
  }

  return context;
}

function useStackedNavigationActions() {
  const context = useContext(StackedNavigationActionsContext);

  if (context === undefined) {
    throw new Error('useStackedNavigationActions must be used within a StackedNavigationProvider');
  }

  return context;
}

function useStackedNavigation() {
  return { ...useStackedNavigationState(), ...useStackedNavigationActions() };
}

export { StackedNavigationProvider, useStackedNavigationState, useStackedNavigationActions, useStackedNavigation };
