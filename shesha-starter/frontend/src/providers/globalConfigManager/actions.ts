import { createAction } from 'redux-actions';
import { IGlobalConfigManagerStateContext } from './contexts';

export enum GlobalConfigManagerActionEnums {
  DefaultAction = 'DEFAULT_ACTION',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const defaultAction = createAction<IGlobalConfigManagerStateContext>(
  GlobalConfigManagerActionEnums.DefaultAction,
  () => ({})
);

/* NEW_ACTION_GOES_HERE */
