import { createAction } from 'redux-actions';
import { ISignalRConnection, ISignalRStateContext } from './contexts';

export enum SignalRActionEnums {
  SetConnection = 'SET_CONNECTION',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setConnectionAction = createAction<ISignalRStateContext, ISignalRConnection>(
  SignalRActionEnums.SetConnection,
  (connection) => ({ connection }),
);
/* NEW_ACTION_GOES_HERE */
