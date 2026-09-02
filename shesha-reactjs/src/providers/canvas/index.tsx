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
import {
  registerCanvasAction, unregisterCanvasAction, setCanvasMeasurementAction, setAvailableCanvasWidthAction,
  setCanvasAutoWidthAction, setCanvasWidthPercentAction, setCanvasAutoZoomAction, setCanvasWidthAction,
  setCanvasZoomAction, setDesignerDeviceAction, setManualZoomAction, setScreenWidthAction,
} from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE, CanvasActionsContext, CanvasStateContext, ICanvasActionsContext, ICanvasMeasurement, ICanvasStateContext, ICanvasWidthMeasurement, DeviceTypes } from './contexts';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { canvasContextCode } from '@/publicJsApis/apis';
import { isDefined } from '@/utils/nullables';
import { throwError } from '@/utils/errors';
import { IObjectMetadata } from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import { SheshaCommonContexts } from '../dataContextManager/models';
import { ContextOnChangeData } from '../dataContextProvider/contexts';
import { useLocalStorage } from '@/hooks';
import { clampZoom, getDeviceTypeByWidth, parseCanvasContextWidth } from './utils';
import { boundCanvasWidthPercent } from './constants';

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
    // Every property here is either handled in contextOnChangeData below or marked readonly in
    // ICanvasContextApi. A property in neither would offer intellisense for a write that is then
    // silently dropped.
    properties: [
      { path: 'zoom', dataType: DataTypes.number },
      { path: 'autoZoom', dataType: DataTypes.boolean },
      { path: 'autoWidth', dataType: DataTypes.boolean },
      { path: 'widthPercent', dataType: DataTypes.number },
      { path: 'designerWidth', dataType: DataTypes.string },
      { path: 'designerDevice', dataType: DataTypes.string },
      { path: 'physicalDevice', dataType: DataTypes.string },
      { path: 'activeDevice', dataType: DataTypes.string },
      { path: 'canvas', dataType: DataTypes.object },
      { path: 'canvasMounts', dataType: DataTypes.number },
    ],
    dataType: DataTypes.object,
  } as IObjectMetadata), []);


  // The zoom/width keys are versioned. The canvas defaults changed (75% manual zoom, responsive
  // "Canvas" width); without a new key, a zoom persisted by the previous version - including one
  // the old auto-zoom computed, e.g. 47% - would silently win over the new default.
  const [storedDesignerWidth, setStoredDesignerWidth] = useLocalStorage('shesha:designerWidth:v2', CANVAS_CONTEXT_INITIAL_STATE.designerWidth);
  const [storedDesigneZoom, setStoredDesigneZoom] = useLocalStorage('shesha:designerZoom:v2', CANVAS_CONTEXT_INITIAL_STATE.zoom);
  const [storedAutoWidth, setStoredAutoWidth] = useLocalStorage('shesha:designerAutoWidth', CANVAS_CONTEXT_INITIAL_STATE.autoWidth);
  // Persisted even while in "Canvas" mode, unlike the width above. "Canvas" is a sizing mode, not
  // a device: styling only supports desktop/tablet/mobile, so the canvas must always resolve to
  // one of the three. Restoring it means a form opens with the styles that were last in effect
  // instead of the initial desktop default until the pane has been measured.
  // Never undefined: exactOptionalPropertyTypes forbids writing an explicit undefined into the
  // optional designerDevice, and a canvas with no device has no styles to render anyway.
  const [storedDesignerDevice, setStoredDesignerDevice] = useLocalStorage<DeviceTypes>('shesha:designerDevice', CANVAS_CONTEXT_INITIAL_STATE.designerDevice ?? 'desktop');
  const [storedWidthPercent, setStoredWidthPercent] = useLocalStorage('shesha:designerWidthPercent', CANVAS_CONTEXT_INITIAL_STATE.widthPercent);

  const [state, dispatch] = useReducer(reducer, {
    ...CANVAS_CONTEXT_INITIAL_STATE,
    designerWidth: storedDesignerWidth,
    zoom: clampZoom(storedDesigneZoom),
    autoWidth: storedAutoWidth,
    designerDevice: storedDesignerDevice,
    // Never seeded from storage: activeDevice is what rendered pages resolve styles from, and the
    // persisted designer device here styled every first paint - and, under SSR, the hydration
    // pass - for whatever was last pinned in the designer. The viewport is the only trustworthy
    // source; the stored designerDevice stays designer-only, narrowed in by the reducer only
    // while a canvas is mounted.
    activeDevice: typeof window !== 'undefined' ? getDeviceTypeByWidth(window.innerWidth) : 'desktop',
    widthPercent: boundCanvasWidthPercent(storedWidthPercent),
  });

  useEffect(() => {
    // In "Canvas" mode designerWidth is a measurement of the pane, not a user choice. Persisting it
    // would restore a stale width on the next load - and lay the canvas out at it for a frame -
    // before the pane has been measured again.
    if (!state.autoWidth)
      setStoredDesignerWidth(state.designerWidth);
    setStoredDesigneZoom(state.zoom);
    setStoredAutoWidth(state.autoWidth);
    setStoredDesignerDevice(state.designerDevice ?? 'desktop');
    setStoredWidthPercent(state.widthPercent);
  }, [setStoredDesigneZoom, setStoredDesignerWidth, setStoredAutoWidth, setStoredDesignerDevice, setStoredWidthPercent,
    state.autoWidth, state.designerWidth, state.zoom, state.designerDevice, state.widthPercent]);

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

  const setCanvasWidthPercent = useCallback((percent: number) => {
    dispatch(setCanvasWidthPercentAction(percent));
  }, []);

  const setAvailableCanvasWidth = useCallback((measurement: ICanvasWidthMeasurement) => {
    dispatch(setAvailableCanvasWidthAction(measurement));
  }, []);

  const setCanvasMeasurement = useCallback((measurement: ICanvasMeasurement) => {
    dispatch(setCanvasMeasurementAction(measurement));
  }, []);

  const registerCanvas = useCallback(() => {
    dispatch(registerCanvasAction());
  }, []);

  const unregisterCanvas = useCallback(() => {
    dispatch(unregisterCanvasAction());
  }, []);

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  const actions = useMemo<ICanvasActionsContext>(() => ({
    setDesignerDevice,
    setCanvasWidth,
    setCanvasZoom,
    setManualZoom,
    setCanvasAutoZoom,
    setCanvasAutoWidth,
    setCanvasWidthPercent,
    setAvailableCanvasWidth,
    setCanvasMeasurement,
    registerCanvas,
    unregisterCanvas,
    /* NEW_ACTION_GOES_HERE */
  }), [setDesignerDevice, setCanvasWidth, setCanvasZoom, setManualZoom, setCanvasAutoZoom, setCanvasAutoWidth, setCanvasWidthPercent, setAvailableCanvasWidth, setCanvasMeasurement, registerCanvas, unregisterCanvas]);

  // Only fired for writes made into the context - by a script, not by the reducer - so applying one
  // through its action cannot feed back. Every writable property in contextMetadata is handled here;
  // the rest are readonly in ICanvasContextApi so a write to one is flagged rather than dropped.
  const contextOnChangeData: ContextOnChangeData<ICanvasStateContext> = useCallback((_, changedData) => {
    if (!isDefined(changedData))
      return;

    if (changedData.designerDevice !== undefined && changedData.designerDevice !== state.designerDevice) {
      setDesignerDevice(changedData.designerDevice);
    }

    if (changedData.autoWidth !== undefined && changedData.autoWidth !== state.autoWidth) {
      setCanvasAutoWidth(changedData.autoWidth);
    }

    if (changedData.widthPercent !== undefined && changedData.widthPercent !== state.widthPercent) {
      setCanvasWidthPercent(changedData.widthPercent);
    }

    // Manual, not setCanvasZoom: an explicit zoom that auto zoom overwrites on the next resize is
    // the same as not having applied it.
    if (changedData.zoom !== undefined && changedData.zoom !== state.zoom && Number.isFinite(changedData.zoom)) {
      setManualZoom(changedData.zoom);
    }

    if (changedData.autoZoom !== undefined && changedData.autoZoom !== state.autoZoom) {
      setCanvasAutoZoom(changedData.autoZoom);
    }

    // A width pins a preset, which needs a device; resolved from the width, as the toolbar does.
    // Only a plain length is accepted ("1024", "1024px" - normalised to px). A percentage routes
    // to widthPercent, again as the toolbar does; anything else ("50vw", "abc") is ignored - a
    // bare parseFloat would read "80%" as 80 and pin an 80px mobile canvas.
    if (changedData.designerWidth !== undefined && changedData.designerWidth !== state.designerWidth) {
      const parsed = parseCanvasContextWidth(changedData.designerWidth);
      if (parsed?.kind === 'px')
        setCanvasWidth(parsed.width, getDeviceTypeByWidth(parsed.width));
      else if (parsed?.kind === 'percent')
        setCanvasWidthPercent(parsed.percent);
    }
  }, [state.designerDevice, state.autoWidth, state.widthPercent, state.zoom, state.autoZoom, state.designerWidth,
    setDesignerDevice, setCanvasAutoWidth, setCanvasWidthPercent, setManualZoom, setCanvasAutoZoom, setCanvasWidth]);

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
