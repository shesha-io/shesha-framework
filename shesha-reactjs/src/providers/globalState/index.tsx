import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import {
  GlobalStateContext,
  IGlobalState,
} from './contexts';
import { GlobalState } from './globalState';

const GlobalStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [, forceUpdate] = React.useState({});

  const [globalState] = useState<IGlobalState>(() => {
    // init new instance of global state
    return new GlobalState(() => forceUpdate({}));
  });

  return (
    <GlobalStateContext.Provider value={globalState}>
      {children}
    </GlobalStateContext.Provider>
  );
};

function useGlobalState() {
  const context = useContext(GlobalStateContext);

  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }

  return context;
}

export default GlobalStateProvider;

export { GlobalStateProvider, useGlobalState };