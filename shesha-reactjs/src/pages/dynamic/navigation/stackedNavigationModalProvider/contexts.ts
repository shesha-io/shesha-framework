import { createContext } from 'react';

export interface IStackedNavigationModalStateContext {
  isMaxWidth?: boolean;
  parentId?: string;
}

export interface IStackedNavigationModalActionsContext {}

export const STACKED_NAVIGATION_MODAL_CONTEXT_INITIAL_STATE: IStackedNavigationModalStateContext = {};

export const StackedNavigationModalStateContext = createContext<IStackedNavigationModalStateContext>(
  STACKED_NAVIGATION_MODAL_CONTEXT_INITIAL_STATE
);
