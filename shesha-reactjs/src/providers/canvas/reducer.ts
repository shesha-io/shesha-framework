import { createReducer } from '@reduxjs/toolkit';
import { setCanvasZoomAction,
  setCanvasWidthAction,
  setScreenWidthAction,
  setDesignerDeviceAction,
  setCanvasAutoZoomAction,
  setCanvasAutoWidthAction,
  setAvailableCanvasWidthAction,
  setManualZoomAction,
  setConfigTreePanelSizeAction,
  setViewTypeAction } from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE } from './contexts';
import { clampZoom, getDeviceTypeByWidth, getSmallerDevice } from './utils';

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
        // Picking an explicit device/resolution preset pins the canvas to that width
        autoWidth: false,
      };
    })
    .addCase(setCanvasAutoWidthAction, (state, { payload }) => {
      const autoWidth = payload !== undefined ? payload : !state.autoWidth;

      return {
        ...state,
        autoWidth,
        // Auto zoom has nothing to fit once the canvas sizes itself to its pane, and the toolbar
        // button that would clear it is disabled in this mode. Leaving it set would strand the
        // canvas with zoom neither computed automatically nor adjustable by pinch/ctrl+wheel.
        autoZoom: autoWidth ? false : state.autoZoom,
      };
    })
    .addCase(setAvailableCanvasWidthAction, (state, { payload }) => {
      // The measured width is only meaningful for the responsive "Canvas" preset. Ignoring it
      // otherwise keeps a stale measurement from overwriting a pinned device width.
      if (!state.autoWidth || state.designerWidth === payload)
        return state;

      return {
        ...state,
        designerWidth: payload,
      };
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
      // Auto zoom fits a fixed-width canvas into its pane; in "Canvas" mode the canvas already
      // fills the pane, so there is nothing to fit. The toolbar button is disabled there, but the
      // invariant belongs in the state rather than in a `disabled` prop: with both flags set,
      // SidebarContainer skips the auto-zoom calculation while usePinchZoom stays locked, leaving
      // the zoom neither computed automatically nor adjustable by the user.
      if (state.autoWidth)
        return state.autoZoom ? { ...state, autoZoom: false } : state;

      return {
        ...state,
        autoZoom: payload !== undefined ? payload : !state.autoZoom,
      };
    })
    .addCase(setConfigTreePanelSizeAction, (state, { payload }) => {
      return {
        ...state,
        configTreePanelSize: payload,
      };
    })
    .addCase(setViewTypeAction, (state, { payload }) => {
      return {
        ...state,
        viewType: payload,
      };
    });
});


