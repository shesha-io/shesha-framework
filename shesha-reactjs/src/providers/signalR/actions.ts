import { createAction } from '@reduxjs/toolkit';
import { ISignalRConnection } from './contexts';

enum SignalRActionEnums {
  SetConnection = 'SET_CONNECTION',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setConnectionAction = createAction<ISignalRConnection | undefined>(SignalRActionEnums.SetConnection);
/* NEW_ACTION_GOES_HERE */
