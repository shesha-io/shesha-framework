import * as signalR from '@microsoft/signalr';

import { FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  ISignalRActionsContext,
  ISignalRConnection,
  ISignalRContext,
  ISignalRStateContext,
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

const SignalRProvider: FC<PropsWithChildren<ISignalRProvider>> = ({
  children,
  baseUrl,
  hubUrl,
  onConnected,
  onDisconnected,
  enableReconnect,
  reconnectIntervals,
}) => {
  const [state, dispatch] = useReducer(signalRReducer, { ...SIGNAL_R_CONTEXT_INITIAL_STATE });
  const { backendUrl } = useSheshaApplication();

  // Memoized so the connection effect can list it as a dependency without tearing down and
  // rebuilding the connection on every render.
  const setConnection = useCallback((connection?: ISignalRConnection) => {
    dispatch(setConnectionAction(connection));
  }, []);

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
  // array literal with the same values doesn't needlessly recreate the connection. The
  // effect reads the values back out of this key instead of closing over the array itself.
  const reconnectIntervalsKey = (reconnectIntervals ?? DEFAULT_RECONNECT_INTERVALS).join(',');

  useEffect(() => {
    // Guards against a start() that resolves after this effect has been cleaned up,
    // which would otherwise push an already-stopped connection back into state.
    let isActive = true;

    let builder = new signalR.HubConnectionBuilder().withUrl(`${baseUrl ?? backendUrl}${hubUrl}`);

    if (enableReconnect) {
      const intervals = reconnectIntervalsKey.length > 0
        ? reconnectIntervalsKey.split(',').map(Number)
        : [];
      builder = builder.withAutomaticReconnect(intervals);
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

      // This effect instance has already been retired and its cleanup stopped this very
      // connection, so a newer instance may already own the connection in state. Reporting a
      // disconnect on a retired connection's behalf would clear the live connection and tell
      // consumers they are offline when they are not.
      if (!isActive)
        return;

      // Otherwise the connection is closed for good (automatic reconnect, when enabled, has
      // already given up), so drop it from state instead of leaving consumers holding a dead
      // connection they might still try to invoke methods on.
      setConnection();
      onDisconnectedRef.current?.();
    });

    connection
      .start()
      .then(() => {
        // The effect was cleaned up while start() was still in flight. Stop the connection
        // here rather than leaving it open in the background, and keep it out of state.
        if (!isActive)
          return connection.stop();

        // Only expose the connection once it has actually started successfully.
        setConnection(connection);
        onConnectedRef.current?.(connection);
        return undefined;
      })
      .catch((err) => console.error('SignalR start failed:', err));

    return () => {
      isActive = false;
      // stop() triggers onclose, but the handler above deliberately ignores it now that this
      // instance is retired, so a teardown never reports a disconnect for a connection that a
      // newer instance may have already replaced in state.
      connection
        .stop()
        .catch((err) => console.error('SignalRProvider connection error', err));

      setConnection();
    };
  }, [baseUrl, backendUrl, hubUrl, enableReconnect, reconnectIntervalsKey, setConnection]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const actions = useMemo<ISignalRActionsContext>(() => ({
    setConnection,
    /* NEW_ACTION_GOES_HERE */
  }), [setConnection]);

  return (
    <SignalRStateContext.Provider value={state}>
      <SignalRActionsContext.Provider value={actions}>
        {children}
      </SignalRActionsContext.Provider>
    </SignalRStateContext.Provider>
  );
};

function useSignalRState(require: boolean = true): ISignalRStateContext | undefined {
  const context = useContext(SignalRStateContext);

  if (context === undefined && require) {
    throw new Error('useSignalRState must be used within a SignalRProvider');
  }

  return context;
}

function useSignalRActions(require: boolean = true): ISignalRActionsContext | undefined {
  const context = useContext(SignalRActionsContext);

  if (context === undefined && require) {
    throw new Error('useSignalRActions must be used within a SignalRProvider');
  }

  return context;
}

function useSignalR(require: boolean = true): ISignalRContext | undefined {
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

export type {
  ISignalRActionsContext,
  ISignalRConnection,
  ISignalRContext,
  ISignalRStateContext,
};
