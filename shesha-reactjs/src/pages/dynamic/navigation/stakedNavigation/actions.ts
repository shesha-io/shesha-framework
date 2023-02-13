import { createAction } from 'redux-actions';
import { IStackedNavigationStateContext } from './contexts';

export enum StackedNavigationActionEnums {
  SetCurrentNavigator = 'SET_CURRENT_NAVIGATOR',
}

export interface ISetNavigatorPayload {
  navigator?: string;
}
export const setCurrentNavigatorAction = createAction<IStackedNavigationStateContext, string>(
  StackedNavigationActionEnums.SetCurrentNavigator,
  (navigator) => ({ navigator })
);
