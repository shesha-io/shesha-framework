import { createReducer } from '@reduxjs/toolkit';
import { setCanvasZoomAction,
  setCanvasWidthAction,
  setScreenWidthAction,
  setDesignerDeviceAction,
  setCanvasAutoZoomAction,
  setCanvasAutoWidthAction,
  setCanvasWidthPercentAction,
  setAvailableCanvasWidthAction,
  setManualZoomAction,
  setCanvasMeasurementAction,
  registerCanvasAction,
  unregisterCanvasAction,
} from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE, ICanvasStateContext } from './contexts';
import { clampZoom, getDeviceTypeByWidth, getSmallerDevice } from './utils';
import { MAX_CANVAS_WIDTH_PERCENT, boundCanvasWidthPercent } from './constants';

/** "Canvas" is a sizing mode, not a device, but styling still has to resolve to one of the three. */
const resolveDeviceForWidth = (state: ICanvasStateContext, width: string): ICanvasStateContext => {
  const parsed = parseFloat(width);
  if (!Number.isFinite(parsed) || parsed <= 0)
    return state;

  const device = getDeviceTypeByWidth(parsed);
  return {
    ...state,
    designerDevice: device,
    activeDevice: getSmallerDevice(device, state.physicalDevice ?? "desktop"),
  };
};

export const reducer = createReducer(CANVAS_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setCanvasZoomAction, (state, { payload }) => {
      return {
        ...state,
        zoom: clampZoom(payload),
      };
    })
    .addCase(setManualZoomAction, (state, { payload }) => {
      return {
        ...state,
        zoom: clampZoom(payload),
        autoZoom: false,
      };
    })
    .addCase(setCanvasWidthAction, (state, { payload }) => {
      const { width, deviceType } = payload;
      const designerWidth = typeof width === 'string' ? width : `${width}px`;

      return {
        ...state,
        designerWidth,
        // A pinned preset is laid out at its own width, so the two widths coincide.
        deviceWidth: designerWidth,
        designerDevice: deviceType,
        activeDevice: getSmallerDevice(deviceType, state.physicalDevice ?? "desktop"),
        // A preset pins the width, which makes any percentage in force meaningless.
        autoWidth: false,
        widthPercent: MAX_CANVAS_WIDTH_PERCENT,
      };
    })
    .addCase(setCanvasAutoWidthAction, (state, { payload }) => {
      const autoWidth = payload !== undefined ? payload : !state.autoWidth;

      const next: ICanvasStateContext = {
        ...state,
        autoWidth,
        // Auto zoom has nothing to fit once the canvas sizes itself to its pane.
        autoZoom: autoWidth ? false : state.autoZoom,
      };

      // designerWidth may still predate the pane; the measurement that follows owns the device.
      return autoWidth ? resolveDeviceForWidth(next, next.designerWidth) : next;
    })
    .addCase(setCanvasWidthPercentAction, (state, { payload }) => {
      // Bounded here too - reachable from the canvas context API, not just the toolbar.
      const next: ICanvasStateContext = {
        ...state,
        widthPercent: boundCanvasWidthPercent(payload),
        autoWidth: true,
        autoZoom: false,
      };

      return resolveDeviceForWidth(next, next.designerWidth);
    })
    .addCase(setAvailableCanvasWidthAction, (state, { payload }) => {
      // Ignored outside "Canvas" mode so a stale measurement cannot overwrite a pinned preset.
      if (!state.autoWidth)
        return state;

      // Device is re-resolved even when the width has not moved: a width restored from storage can
      // already equal the measured one while the device is still the initial default.
      const { layoutWidth, deviceWidth } = payload;
      const measured = state.designerWidth === layoutWidth && state.deviceWidth === deviceWidth
        ? state
        : { ...state, designerWidth: layoutWidth, deviceWidth };
      // Resolved from the on-screen width, not the zoom-derived layout width: zoom is a magnifier,
      // and zooming in must not silently retarget style edits at a narrower device.
      const resolved = resolveDeviceForWidth(measured, deviceWidth);

      return measured === state &&
        resolved.designerDevice === state.designerDevice &&
        resolved.activeDevice === state.activeDevice
        ? state
        : resolved;
    })
    .addCase(setCanvasMeasurementAction, (state, { payload }) => {
      // Re-reported on every resize tick; returning state unchanged keeps the render count down.
      return state.canvas?.width === payload.width && state.canvas.height === payload.height
        ? state
        : { ...state, canvas: payload };
    })
    .addCase(registerCanvasAction, (state) => {
      return { ...state, canvasMounts: state.canvasMounts + 1 };
    })
    .addCase(unregisterCanvasAction, (state) => {
      // Refcounted: the quick-edit dialog's canvas closing must not blank the designer's own.
      const canvasMounts = Math.max(0, state.canvasMounts - 1);
      return canvasMounts === 0
        ? { ...state, canvasMounts, canvas: undefined }
        : { ...state, canvasMounts };
    })
    .addCase(setScreenWidthAction, (state, { payload }) => {
      const device = getDeviceTypeByWidth(payload);
      return {
        ...state,
        physicalDevice: device,
        // With no canvas mounted the physical device is the only one there is. Narrowing against a
        // designerDevice restored from storage is what pinned rendered pages to mobile for good.
        activeDevice: state.canvasMounts > 0
          ? getSmallerDevice(device, state.designerDevice ?? "desktop")
          : device,
      };
    })
    .addCase(setDesignerDeviceAction, (state, { payload }) => {
      return {
        ...state,
        designerWidth: state.designerWidth,
        designerDevice: payload,
        activeDevice: getSmallerDevice(payload, state.physicalDevice ?? "desktop"),
      };
    })
    .addCase(setCanvasAutoZoomAction, (state, { payload }) => {
      // Invariant, not just a disabled toolbar button: both flags set would strand the zoom.
      if (state.autoWidth)
        return state.autoZoom ? { ...state, autoZoom: false } : state;

      return {
        ...state,
        autoZoom: payload !== undefined ? payload : !state.autoZoom,
      };
    });
});


