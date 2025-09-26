// tslint:disable-next-line:no-var-requires
const signalR = require('@microsoft/signalr');

import React, { PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  ISignalRConnection,
  SIGNAL_R_CONTEXT_INITIAL_STATE,
  SignalRActionsContext,
  SignalRStateContext,
} from './contexts';
import { signalRReducer } from './reducer';
// @ts-ignore
import { usePrevious } from '@/hooks';
import { setConnectionAction } from './actions';
import { useSheshaApplication } from '../sheshaApplication';

export interface ISignalRProvider {
  hubUrl: string;
  baseUrl?: string;
  onConnected?: (connection: ISignalRConnection) => void;
  onDisconnected?: () => void;
  enableReconnect?: boolean;
  reconnectIntervals?: number[]; // default: [0, 2000, 5000, 10000]
}

function SignalRProvider({
  children,
  baseUrl,
  hubUrl,
  onConnected,
  onDisconnected,
  enableReconnect,
  reconnectIntervals,
}: PropsWithChildren<ISignalRProvider>) {
  const [state, dispatch] = useReducer(signalRReducer, { ...SIGNAL_R_CONTEXT_INITIAL_STATE });
  const { backendUrl } = useSheshaApplication();

  const previousBaseUrl = usePrevious(baseUrl);

  const setConnection = (connection?: ISignalRConnection) => {
    dispatch(setConnectionAction(connection));
  };

  useEffect(() => {
    if (state.connection || (previousBaseUrl && previousBaseUrl === baseUrl)) {
      return undefined;
    }

    let builder = new signalR.HubConnectionBuilder().withUrl(`${baseUrl ?? backendUrl}${hubUrl}`);

    if (enableReconnect) {
      builder = builder.withAutomaticReconnect(reconnectIntervals ?? [0, 2000, 5000, 10000]);
    }

    const connection: ISignalRConnection = builder.build();

    connection
      .start()
      .then(() => {
        onConnected?.(connection);
      })
      .catch((err) => console.error('SignalR start failed:', err));

    if (enableReconnect) {
      connection.onreconnecting((error) => {
        console.warn('SignalR reconnecting...', error);
      });

      connection.onreconnected(() => {
        onConnected?.(connection);
      });
    }

    connection.onclose((error) => {
      console.error('SignalR connection closed', error);
      onDisconnected?.();
    });
    
    setConnection(connection);

    return () => {
      connection
        ?.stop()
        ?.then(() => {
          if (onDisconnected) {
            onDisconnected();
          }
        })
        ?.catch((err) => console.error('SignalRProvider connection error', err));

      setConnection();
    };
  }, [baseUrl, backendUrl, hubUrl, enableReconnect, reconnectIntervals]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <SignalRStateContext.Provider value={state}>
      <SignalRActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </SignalRActionsContext.Provider>
    </SignalRStateContext.Provider>
  );
}

function useSignalRState(require: boolean) {
  const context = useContext(SignalRStateContext);

  if (context === undefined && require) {
    throw new Error('useSignalRState must be used within a SignalRProvider');
  }

  return context;
}

function useSignalRActions(require: boolean) {
  const context = useContext(SignalRActionsContext);

  if (context === undefined && require) {
    throw new Error('useSignalRActions must be used within a SignalRProvider');
  }

  return context;
}

function useSignalR(require: boolean = true) {
  const actionsContext = useSignalRActions(require);
  const stateContext = useSignalRState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

export default SignalRProvider;

export { SignalRProvider, useSignalR, useSignalRActions, useSignalRState };
