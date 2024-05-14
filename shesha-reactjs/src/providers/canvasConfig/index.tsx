import React, {
  FC,
  PropsWithChildren,
  useContext,
  useReducer
  } from 'react';
import CanvasReducer from './reducer';
import { getFlagSetters } from '../utils/flagsSetters';
import { setCanvasWidthAction, setCanvasZoomAction } from './actions';
import {
CANVAS_CONFIG_CONTEXT_INITIAL_STATE,
CanvasConfigActionsContext,
CanvasConfigStateContext
} from './contexts';

export interface ICanvasProviderProps {
 
}

const CanvasProvider: FC<PropsWithChildren<ICanvasProviderProps>> = ({
  children,
}) => {

  const [state, dispatch] = useReducer(CanvasReducer, {
    ...CANVAS_CONFIG_CONTEXT_INITIAL_STATE,
  });

 

  const  setCanvasWidth = (width: number) => {
    dispatch(setCanvasWidthAction(width));
  };
  const  setCanvasZoom = (zoom: number) => {
    dispatch(setCanvasZoomAction(zoom));
  };
  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <CanvasConfigStateContext.Provider value={state}>
      <CanvasConfigActionsContext.Provider
        value={{
          ...getFlagSetters(dispatch),
          setCanvasWidth,
          setCanvasZoom
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </CanvasConfigActionsContext.Provider>
    </CanvasConfigStateContext.Provider>
  );
};

function useCanvasConfigState(require: boolean) {
  const context = useContext(CanvasConfigStateContext);

  if (context === undefined && require) {
    throw new Error('useCanvasConfigState must be used within a CanvasProvider');
  }

  return context;
}

function useCanvasConfigActions(require: boolean) {
  const context = useContext(CanvasConfigActionsContext);

  if (context === undefined && require) {
    throw new Error('useCanvasConfigActions must be used within a CanvasProvider');
  }

  return context;
}

function useCanvasConfig(require: boolean = true) {
  const actionsContext = useCanvasConfigActions(require);
  const stateContext = useCanvasConfigState(require);

  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}


//#endregion

export {
  CanvasProvider,
  useCanvasConfig,
  useCanvasConfigActions, // note: to be removed
  useCanvasConfigState
};
