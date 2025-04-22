import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import {
  GlobalStateContext,
  IGlobalState,
} from './contexts';
import { GlobalState } from './globalState';

const GlobalStateProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, forceUpdate] = React.useState({});

  //ToDo: AS - need to review and implement a mechanism for subscribing to changes

  const [globalState] = useState<IGlobalState>(() => {
    // init new instance of global state
    return new GlobalState(() => {
      forceUpdate({});
    });
  });

  return (
    <GlobalStateContext.Provider value={{globalState, state}}>
      {children}
    </GlobalStateContext.Provider>
  );
};

function useGlobalState() {
  const context = useContext(GlobalStateContext);

  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }

  return context.globalState;
}

export default GlobalStateProvider;

export { GlobalStateProvider, useGlobalState };