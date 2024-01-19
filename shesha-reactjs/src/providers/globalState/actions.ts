import { createAction } from 'redux-actions';
import { ISetStatePayload } from './contexts';

export enum GlobalStateActionEnums {
  SetState = 'SET_STATE',
  ClearState = 'CLEAR_STATE',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setStateAction = createAction<ISetStatePayload, ISetStatePayload>(
  GlobalStateActionEnums.SetState,
  (p) => p
);

export const clearStateAction = createAction<string, string>(GlobalStateActionEnums.ClearState, (p) => p);

/* NEW_ACTION_GOES_HERE */
