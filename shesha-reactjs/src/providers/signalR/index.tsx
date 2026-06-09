import * as signalR from '@microsoft/signalr';

import React, { PropsWithChildren, useContext, useEffect, useReducer, useRef } from 'react';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  ISignalRConnection,
  SIGNAL_R_CONTEXT_INITIAL_STATE,
  SignalRActionsContext,
  SignalRStateContext,
} from './contexts';
import { signalRReducer } from './reducer';
import { setConnectionAction } from './actions';
import { useSheshaApplication } from '../sheshaApplication';

const DEFAULT_RECONNECT_INTERVALS = [0, 2000, 5000, 10000];

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

  const setConnection = (connection?: ISignalRConnection) => {
    dispatch(setConnectionAction(connection));
  };

  // Keep the latest callbacks in refs so the SignalR event handlers always invoke the
  // current callbacks without having to list them as effect deps (which would tear down
  // and rebuild the connection whenever the parent passes new callback identities).
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onDisconnectedRef.current = onDisconnected;
  });

  // Depend on the reconnect interval *values*, not the array's identity, so passing a new
  // array literal with the same values doesn't needlessly recreate the connection.
  const reconnectIntervalsKey = (reconnectIntervals ?? DEFAULT_RECONNECT_INTERVALS).join(',');

  useEffect(() => {
    // Guards against a start() that resolves after this effect has been cleaned up,
    // which would otherwise push an already-stopped connection back into state.
    let isActive = true;

    let builder = new signalR.HubConnectionBuilder().withUrl(`${baseUrl ?? backendUrl}${hubUrl}`);

    if (enableReconnect) {
      builder = builder.withAutomaticReconnect(reconnectIntervals ?? DEFAULT_RECONNECT_INTERVALS);
    }

    const connection: ISignalRConnection = builder.build();

    if (enableReconnect) {
      connection.onreconnecting((error) => {
        console.warn('SignalR reconnecting...', error);
      });

      connection.onreconnected(() => {
        onConnectedRef.current?.(connection);
      });
    }

    connection.onclose((error) => {
      console.error('SignalR connection closed', error);
      onDisconnectedRef.current?.();
    });

    connection
      .start()
      .then(() => {
        // Only expose the connection once it has actually started successfully,
        // and only if this effect instance is still active.
        if (!isActive) return;
        setConnection(connection);
        onConnectedRef.current?.(connection);
      })
      .catch((err) => console.error('SignalR start failed:', err));

    return () => {
      isActive = false;
      connection
        ?.stop()
        ?.then(() => {
          onDisconnectedRef.current?.();
        })
        ?.catch((err) => console.error('SignalRProvider connection error', err));

      setConnection();
    };
  }, [baseUrl, backendUrl, hubUrl, enableReconnect, reconnectIntervalsKey]);

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
