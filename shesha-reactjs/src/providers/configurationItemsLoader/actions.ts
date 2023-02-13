import { createAction } from 'redux-actions';

export enum ConfigurationItemsLoaderActionEnums {
  ActivateProvider = 'ACTIVATE_PROVIDER',

  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const activateProviderAction = createAction<string, string>(
  ConfigurationItemsLoaderActionEnums.ActivateProvider,
  p => p
);


/* NEW_ACTION_GOES_HERE */
