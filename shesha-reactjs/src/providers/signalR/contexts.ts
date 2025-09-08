import { createNamedContext } from '@/utils/react';
import { HubConnection } from '@microsoft/signalr';

export type IFlagProgressFlags = '__DEFAULT__';
export type IFlagSucceededFlags = '__DEFAULT__';
export type IFlagErrorFlags = '__DEFAULT__';
export type IFlagActionedFlags = '__DEFAULT__';

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

export const SignalRStateContext = createNamedContext<ISignalRStateContext>(SIGNAL_R_CONTEXT_INITIAL_STATE, "SignalRStateContext");

export const SignalRActionsContext = createNamedContext<ISignalRActionsContext>(undefined, "SignalRActionsContext");
