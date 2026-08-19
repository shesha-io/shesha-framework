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
import { DEFAULT_OPTIONS, getDeviceTypeByWidth, getSmallerDevice } from './utils';

const clampZoom = (zoom: number): number =>
  Math.max(DEFAULT_OPTIONS.minZoom, Math.min(DEFAULT_OPTIONS.maxZoom, zoom));

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
      return {
        ...state,
        autoWidth: payload !== undefined ? payload : !state.autoWidth,
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


