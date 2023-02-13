import { HubConnection } from '@microsoft/signalr';
import { createContext } from 'react';

export type IFlagProgressFlags = '__DEFAULT__' /* NEW_IN_PROGRESS_FLAG_GOES_HERE */;
export type IFlagSucceededFlags = '__DEFAULT__' /* NEW_SUCCEEDED_FLAG_GOES_HERE */;
export type IFlagErrorFlags = '__DEFAULT__' /* NEW_ERROR_FLAG_GOES_HERE */;
export type IFlagActionedFlags = '__DEFAULT__' /* NEW_ACTIONED_FLAG_GOES_HERE */;

export interface ISignalRConnection extends HubConnection {}

export interface ISignalRStateContext {
  connection?: HubConnection;
}

export interface ISignalRActionsContext {
  /* NEW_ACTION_ACTION_DECLARATIO_GOES_HERE */
}

export const SIGNAL_R_CONTEXT_INITIAL_STATE: ISignalRStateContext = {
  connection: null,
};

export const SignalRStateContext = createContext<ISignalRStateContext>(SIGNAL_R_CONTEXT_INITIAL_STATE);

export const SignalRActionsContext = createContext<ISignalRActionsContext>(undefined);
