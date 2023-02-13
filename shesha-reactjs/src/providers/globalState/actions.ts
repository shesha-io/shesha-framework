import { createAction } from 'redux-actions';
import { ISetPubSubPayload, ISetStatePayload } from './contexts';

export enum GlobalStateActionEnums {
  SetPubSub = 'SET_PUB_SUB',
  SetState = 'SET_STATE',
  ClearState = 'CLEAR_STATE',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setStateAction = createAction<ISetStatePayload, ISetStatePayload>(GlobalStateActionEnums.SetState, p => p);

export const clearStateAction = createAction<string, string>(GlobalStateActionEnums.ClearState, p => p);

export const setPubsubAction = createAction<ISetPubSubPayload, ISetPubSubPayload>(
  GlobalStateActionEnums.SetPubSub,
  p => p
);
/* NEW_ACTION_GOES_HERE */
