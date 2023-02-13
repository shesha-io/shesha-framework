import { createContext } from 'react';

export const ROOT_NAVIGATOR_ID = 'a66c4992-543c-11ed-bdc3-0242ac120002';

export interface IStackedNavigationStateContext {
  navigator?: string;
}

export interface IStackedNavigationActionsContext {
  setCurrentNavigator: (navigator: string) => void;
}

export const STACKED_NAVIGATION_CONTEXT_INITIAL_STATE: IStackedNavigationStateContext = {
  navigator: null,
};

export const StackedNavigationStateContext = createContext<IStackedNavigationStateContext>(
  STACKED_NAVIGATION_CONTEXT_INITIAL_STATE
);

export const StackedNavigationActionsContext = createContext<IStackedNavigationActionsContext>(undefined);
