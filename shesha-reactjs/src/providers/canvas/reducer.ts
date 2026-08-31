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

      return {
        ...state,
        designerWidth: typeof width === 'string' ? width : `${width}px`,
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
      const measured = state.designerWidth === payload ? state : { ...state, designerWidth: payload };
      const resolved = resolveDeviceForWidth(measured, payload);

      return measured === state &&
        resolved.designerDevice === state.designerDevice &&
        resolved.activeDevice === state.activeDevice
        ? state
        : resolved;
    })
    .addCase(setScreenWidthAction, (state, { payload }) => {
      const device = getDeviceTypeByWidth(payload);
      return {
        ...state,
        physicalDevice: device,
        activeDevice: getSmallerDevice(device, state.designerDevice ?? "desktop"),
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


