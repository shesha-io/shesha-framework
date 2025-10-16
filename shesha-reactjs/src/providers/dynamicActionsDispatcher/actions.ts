import { createAction } from 'redux-actions';

export enum DynamicActionsDispatcherActionEnums {
  ActivateProvider = 'ACTIVATE_PROVIDER',
}

export const activateProviderAction = createAction<string, string>(
  DynamicActionsDispatcherActionEnums.ActivateProvider,
  (p) => p,
);
