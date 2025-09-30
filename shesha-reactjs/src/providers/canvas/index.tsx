import React, { FC, PropsWithChildren, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import CanvasReducer from './reducer';
import { SetCanvasAutoZoomAction, setCanvasWidthAction, setCanvasZoomAction, SetConfigTreePanelSizeAction, setDesignerDeviceAction, setScreenWidthAction } from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE, CanvasActionsContext, CanvasStateContext, ICanvasStateContext, IDeviceTypes } from './contexts';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { DataTypes, IObjectMetadata } from '@/index';
import { canvasContextCode } from '@/publicJsApis';

export interface ICanvasProviderProps {
}

const CanvasProvider: FC<PropsWithChildren<ICanvasProviderProps>> = ({
  children,
}) => {
  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => {
      return Promise.resolve({
        typeName: 'ICanvasContextApi',
        files: [{
          content: canvasContextCode,
          fileName: 'apis/CanvasContextApi.ts',
        }],
      });
    },
    properties: [
      { path: 'zoom', dataType: DataTypes.number },
      { path: 'designerWidth', dataType: DataTypes.string },
      { path: 'designerDevice', dataType: DataTypes.string },
      { path: 'physicalDevice', dataType: DataTypes.string },
      { path: 'activeDevice', dataType: DataTypes.string },
    ],
    dataType: DataTypes.object,
  } as IObjectMetadata), []);

  const [state, dispatch] = useReducer(CanvasReducer, {
    ...CANVAS_CONTEXT_INITIAL_STATE,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => dispatch(setScreenWidthAction(window.innerWidth));
    window.addEventListener('resize', handleResize);
    dispatch(setScreenWidthAction(window.innerWidth));
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setDesignerDevice = useCallback((deviceType: IDeviceTypes) => {
    dispatch(setDesignerDeviceAction(deviceType));
  }, []);

  const setCanvasWidth = useCallback((width: number, deviceType: string) => {
    dispatch(setCanvasWidthAction({ width, deviceType }));
  }, []);

  const setCanvasZoom = useCallback((zoom: number) => {
    dispatch(setCanvasZoomAction(zoom));
  }, []);

  const setCanvasAutoZoom = useCallback(() => {
    dispatch(SetCanvasAutoZoomAction());
  }, []);

  const setConfigTreePanelSize = useCallback((size: number) => {
    dispatch(SetConfigTreePanelSizeAction(size));
  }, []);
  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const actions = useMemo(() => ({
    setDesignerDevice,
    setCanvasWidth,
    setCanvasZoom,
    setCanvasAutoZoom,
    setConfigTreePanelSize,
    /* NEW_ACTION_GOES_HERE */
  }), [setDesignerDevice, setCanvasWidth, setCanvasZoom, setCanvasAutoZoom, setConfigTreePanelSize]);

  const contextOnChangeData = useCallback((_data: any, changedData: ICanvasStateContext) => {
    if (!changedData)
      return;

    if (changedData.designerDevice !== undefined && changedData.designerDevice !== state.designerDevice) {
      setDesignerDevice(changedData.designerDevice);
    }
  }, [state.designerDevice, setDesignerDevice]);

  return (
    <DataContextBinder
      id="canvasContext"
      name="canvasContext"
      description="Canvas context"
      type="appLayer"
      data={state}
      api={actions}
      onChangeData={contextOnChangeData}
      metadata={contextMetadata}
    >
      <CanvasStateContext.Provider value={state}>
        <CanvasActionsContext.Provider value={actions}>
          {children}
        </CanvasActionsContext.Provider>
      </CanvasStateContext.Provider>
    </DataContextBinder>
  );
};

function useCanvasState(require: boolean) {
  const context = useContext(CanvasStateContext);

  if (context === undefined && require) {
    throw new Error('useCanvasState must be used within a CanvasProvider');
  }

  return context;
}

function useCanvasActions(require: boolean) {
  const context = useContext(CanvasActionsContext);

  if (context === undefined && require) {
    throw new Error('useCanvasActions must be used within a CanvasProvider');
  }

  return context;
}

function useCanvas(require: boolean = true) {
  const actionsContext = useCanvasActions(require);
  const stateContext = useCanvasState(require);

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
  useCanvas,
  useCanvasActions,
  useCanvasState,
};
