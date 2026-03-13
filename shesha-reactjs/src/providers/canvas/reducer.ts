import { createReducer } from '@reduxjs/toolkit';
import { setCanvasZoomAction,
  setCanvasWidthAction,
  setScreenWidthAction,
  setDesignerDeviceAction,
  setCanvasAutoZoomAction,
  setConfigTreePanelSizeAction,
  setViewTypeAction } from './actions';
import { CANVAS_CONTEXT_INITIAL_STATE, IDeviceTypes } from './contexts';
import { getDeviceTypeByWidth, getSmallerDevice, getWidthByDeviceType } from './utils';

export const reducer = createReducer(CANVAS_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setCanvasZoomAction, (state, { payload }) => {
      return {
        ...state,
        zoom: payload,
      };
    })
    .addCase(setCanvasWidthAction, (state, { payload }) => {
      const { width, deviceType } = payload;

      return {
        ...state,
        designerWidth: typeof width === 'string' ? width : `${width}px`,
        designerDevice: deviceType as IDeviceTypes,
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
        designerWidth: state.designerWidth ?? getWidthByDeviceType(payload),
        designerDevice: payload,
        activeDevice: getSmallerDevice(payload, state.physicalDevice ?? "desktop"),
      };
    })
    .addCase(setCanvasAutoZoomAction, (state) => {
      return {
        ...state,
        autoZoom: !state.autoZoom,
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


