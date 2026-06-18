import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import {
  GlobalStateContext,
  IGlobalState,
} from './contexts';
import { GlobalState } from './globalState';
import { throwError } from '@/utils/errors';

const GlobalStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, forceUpdate] = React.useState({});

  // ToDo: AS - need to review and implement a mechanism for subscribing to changes

  const [globalState] = useState<IGlobalState>(() => {
    // init new instance of global state
    return new GlobalState(() => {
      forceUpdate({});
    });
  });

  return (
    <GlobalStateContext.Provider value={{ globalState, state }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

const useGlobalState = (): IGlobalState => useContext(GlobalStateContext)?.globalState ?? throwError("useGlobalState must be used within a GlobalStateProvider");

export default GlobalStateProvider;

export { GlobalStateProvider, useGlobalState };
