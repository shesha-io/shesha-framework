import * as signalR from '@microsoft/signalr';

import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import {
  ISignalRConnection,
  ISignalRStateContext,
  SIGNAL_R_CONTEXT_INITIAL_STATE,
  SignalRStateContext,
} from './contexts';
import { signalRReducer } from './reducer';
import { usePrevious } from '@/hooks';
import { setConnectionAction } from './actions';
import { useSheshaApplication } from '../sheshaApplication';

export interface ISignalRProvider {
  hubUrl: string;
  baseUrl?: string;
  onConnected?: (connection: ISignalRConnection) => void;
  onDisconnected?: () => void;
}

const SignalRProvider: FC<PropsWithChildren<ISignalRProvider>> = ({
  children,
  baseUrl,
  hubUrl,
  onConnected,
  onDisconnected,
}) => {
  const [state, dispatch] = useReducer(signalRReducer, { ...SIGNAL_R_CONTEXT_INITIAL_STATE });
  const { backendUrl } = useSheshaApplication();

  const previousBaseUrl = usePrevious(baseUrl);

  const setConnection = (connection?: ISignalRConnection): void => {
    dispatch(setConnectionAction(connection));
  };

  useEffect(() => {
    if (state.connection || (previousBaseUrl && previousBaseUrl === baseUrl)) {
      return undefined;
    }

    const connection: ISignalRConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl ?? backendUrl}${hubUrl}`)
      .build();

    connection.start().then(() => {
      if (onConnected) {
        onConnected(connection);
      }
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
  }, [baseUrl, backendUrl, hubUrl]);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <SignalRStateContext.Provider value={state}>
      {children}
    </SignalRStateContext.Provider>
  );
};

function useSignalRState(require: boolean): ISignalRStateContext | undefined {
  const context = useContext(SignalRStateContext);

  if (context === undefined && require) {
    throw new Error('useSignalRState must be used within a SignalRProvider');
  }

  return context;
}

function useSignalR(require: boolean = true): ISignalRStateContext | undefined {
  return useSignalRState(require);
}

export default SignalRProvider;

export { SignalRProvider, useSignalR, useSignalRState };
