import {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from 'react';
import { reducer } from './reducer';
import { setAvailableCanvasWidthAction, setCanvasAutoWidthAction, setCanvasAutoZoomAction, setCanvasWidthAction, setCanvasZoomAction, setConfigTreePanelSizeAction, setDesignerDeviceAction, setManualZoomAction, setScreenWidthAction, setViewTypeAction } from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE, CanvasActionsContext, CanvasStateContext, ICanvasActionsContext, ICanvasStateContext, DeviceTypes, IViewType } from './contexts';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { canvasContextCode } from '@/publicJsApis/apis';
import { isDefined } from '@/utils/nullables';
import { throwError } from '@/utils/errors';
import { IObjectMetadata } from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import { SheshaCommonContexts } from '../dataContextManager/models';
import { ContextOnChangeData } from '../dataContextProvider/contexts';
import { useLocalStorage } from '@/hooks';
import { clampZoom, getDeviceTypeByWidth } from './utils';

interface IRestoredCanvasState {
  designerWidth: string;
  zoom: number;
  autoWidth: boolean;
}

/**
 * Builds the reducer's initial state from what was restored out of local storage, deriving the
 * device from the restored width.
 *
 * The width is persisted but the device is not, so spreading the defaults alone restores a pinned
 * 375px canvas with `designerDevice: 'desktop'` - a phone-width canvas rendering every component
 * from its desktop settings block, on nothing more than a page reload. The device is a function of
 * the width (the same one `setCanvasWidthAction` applies), so derive it rather than persisting a
 * second copy that can disagree with the width it describes.
 *
 * `activeDevice` starts as the canvas device alone because `physicalDevice` is not known until the
 * mount effect below measures the window; that effect clamps it a tick later.
 */
export const getInitialState = ({ designerWidth, zoom, autoWidth }: IRestoredCanvasState): ICanvasStateContext => {
  const restoredWidth = parseInt(designerWidth, 10);
  const designerDevice = Number.isFinite(restoredWidth) && restoredWidth > 0
    ? getDeviceTypeByWidth(restoredWidth)
    : CANVAS_CONTEXT_INITIAL_STATE.designerDevice ?? 'desktop';

  return {
    ...CANVAS_CONTEXT_INITIAL_STATE,
    designerWidth,
    zoom: clampZoom(zoom),
    autoWidth,
    designerDevice,
    activeDevice: designerDevice,
  };
};

const CanvasProvider: FC<PropsWithChildren> = ({
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


  // The zoom/width keys are versioned. The canvas defaults changed (75% manual zoom, responsive
  // "Canvas" width); without a new key, a zoom persisted by the previous version - including one
  // the old auto-zoom computed, e.g. 47% - would silently win over the new default.
  const [storedDesignerWidth, setStoredDesignerWidth] = useLocalStorage('shesha:designerWidth:v2', CANVAS_CONTEXT_INITIAL_STATE.designerWidth);
  const [storedDesigneZoom, setStoredDesigneZoom] = useLocalStorage('shesha:designerZoom:v2', CANVAS_CONTEXT_INITIAL_STATE.zoom);
  const [storedAutoWidth, setStoredAutoWidth] = useLocalStorage('shesha:designerAutoWidth', CANVAS_CONTEXT_INITIAL_STATE.autoWidth);

  const [state, dispatch] = useReducer(
    reducer,
    { designerWidth: storedDesignerWidth, zoom: storedDesigneZoom, autoWidth: storedAutoWidth },
    getInitialState,
  );

  useEffect(() => {
    // In "Canvas" mode designerWidth is a measurement of the pane, not a user choice. Persisting it
    // would restore a stale width on the next load - and lay the canvas out at it for a frame -
    // before the pane has been measured again.
    if (!state.autoWidth)
      setStoredDesignerWidth(state.designerWidth);
    setStoredDesigneZoom(state.zoom);
    setStoredAutoWidth(state.autoWidth);
  }, [setStoredDesigneZoom, setStoredDesignerWidth, setStoredAutoWidth, state.autoWidth, state.designerWidth, state.zoom]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = (): void => dispatch(setScreenWidthAction(window.innerWidth));
    window.addEventListener('resize', handleResize);
    dispatch(setScreenWidthAction(window.innerWidth));
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setDesignerDevice = useCallback((deviceType: DeviceTypes) => {
    dispatch(setDesignerDeviceAction(deviceType));
  }, []);

  const setCanvasWidth = useCallback((width: number | string, deviceType: DeviceTypes) => {
    dispatch(setCanvasWidthAction({ width: typeof width === 'string' ? width : `${width}px`, deviceType }));
  }, []);

  const setCanvasZoom = useCallback((zoom: number) => {
    dispatch(setCanvasZoomAction(zoom));
  }, []);

  const setManualZoom = useCallback((zoom: number) => {
    dispatch(setManualZoomAction(zoom));
  }, []);

  const setCanvasAutoZoom = useCallback((value?: boolean) => {
    dispatch(setCanvasAutoZoomAction(value));
  }, []);

  const setCanvasAutoWidth = useCallback((value?: boolean) => {
    dispatch(setCanvasAutoWidthAction(value));
  }, []);

  const setAvailableCanvasWidth = useCallback((width: string) => {
    dispatch(setAvailableCanvasWidthAction(width));
  }, []);

  const setConfigTreePanelSize = useCallback((size: number) => {
    dispatch(setConfigTreePanelSizeAction(size));
  }, []);

  const setViewType = useCallback((viewType: IViewType) => {
    dispatch(setViewTypeAction(viewType));
  }, []);
  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const actions = useMemo<ICanvasActionsContext>(() => ({
    setDesignerDevice,
    setCanvasWidth: setCanvasWidth,
    setCanvasZoom,
    setManualZoom,
    setCanvasAutoZoom,
    setCanvasAutoWidth,
    setAvailableCanvasWidth,
    setConfigTreePanelSize,
    setViewType,
    /* NEW_ACTION_GOES_HERE */
  }), [setDesignerDevice, setCanvasWidth, setCanvasZoom, setManualZoom, setCanvasAutoZoom, setCanvasAutoWidth, setAvailableCanvasWidth, setConfigTreePanelSize, setViewType]);

  const contextOnChangeData: ContextOnChangeData<ICanvasStateContext> = useCallback((_, changedData) => {
    if (!isDefined(changedData))
      return;

    if (changedData.designerDevice !== undefined && changedData.designerDevice !== state.designerDevice) {
      setDesignerDevice(changedData.designerDevice);
    }
  }, [state.designerDevice, setDesignerDevice]);

  return (
    <DataContextBinder<ICanvasStateContext>
      id={SheshaCommonContexts.CanvasContext}
      name={SheshaCommonContexts.CanvasContext}
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

const useCanvasStateOrUndefined = (): ICanvasStateContext | undefined => useContext(CanvasStateContext);
const useCanvasState = (): ICanvasStateContext => useCanvasStateOrUndefined() ?? throwError('useCanvasState must be used within a CanvasProvider');

const useCanvasActionsOrUndefined = (): ICanvasActionsContext | undefined => useContext(CanvasActionsContext);
const useCanvasActions = (): ICanvasActionsContext => useCanvasActionsOrUndefined() ?? throwError('useCanvasActions must be used within a CanvasProvider');

const useCanvasOrUndefined = (): ICanvasStateContext & ICanvasActionsContext | undefined => {
  const actionsContext = useCanvasActionsOrUndefined();
  const stateContext = useCanvasStateOrUndefined();

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useCanvas = (): ICanvasStateContext & ICanvasActionsContext => {
  const context = useCanvasOrUndefined();
  if (context === undefined)
    throw new Error('useCanvas must be used within a CanvasProvider');

  return context;
};


//#endregion

export {
  CanvasProvider,
  useCanvas,
  useCanvasOrUndefined,
  useCanvasActions,
  useCanvasActionsOrUndefined,
  useCanvasState,
  useCanvasStateOrUndefined,
};
