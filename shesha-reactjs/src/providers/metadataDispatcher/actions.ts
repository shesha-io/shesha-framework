import { createAction } from 'redux-actions';

export enum MetadataDispatcherActionEnums {
  ActivateProvider = 'ACTIVATE_PROVIDER',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const activateProviderAction = createAction<string, string>(
  MetadataDispatcherActionEnums.ActivateProvider,
  (p) => p
);

/* NEW_ACTION_GOES_HERE */
