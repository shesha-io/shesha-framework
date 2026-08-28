import { createNamedContext } from '@/utils/react';
import { HubConnection } from '@microsoft/signalr';

export type ISignalRConnection = HubConnection;

export interface ISignalRStateContext {
  connection?: ISignalRConnection | undefined;
}

export interface ISignalRActionsContext {
  setConnection: (connection?: ISignalRConnection) => void;
  /* NEW_ACTION_ACTION_DECLARATION_GOES_HERE */
}

export type ISignalRContext = ISignalRStateContext & ISignalRActionsContext;

export const SIGNAL_R_CONTEXT_INITIAL_STATE: ISignalRStateContext = {};

export const SignalRStateContext = createNamedContext<ISignalRStateContext | undefined>(undefined, "SignalRStateContext");

export const SignalRActionsContext = createNamedContext<ISignalRActionsContext | undefined>(undefined, "SignalRActionsContext");
