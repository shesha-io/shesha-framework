import { createAction } from '@reduxjs/toolkit';
import { ICanvasMeasurement, ICanvasWidthMeasurement, ICanvasWidthProps, DeviceTypes } from './contexts';

export enum CanvasConfigActionEnums {
  SetCanvasWidth = 'SET_FORM_WIDTH',
  SetCanvasZoom = 'SET_FORM_ZOOM',
  SetDesignerDevice = 'SET_DESIGNER_DEVICE',
  SetScreenWidth = 'SET_SCREEN_WIDTH',
  SetCanvasAutoZoom = 'SET_AUTO_ZOOM',
  SetCanvasAutoWidth = 'SET_AUTO_WIDTH',
  SetAvailableCanvasWidth = 'SET_AVAILABLE_CANVAS_WIDTH',
  SetCanvasWidthPercent = 'SET_CANVAS_WIDTH_PERCENT',
  SetManualZoom = 'SET_MANUAL_ZOOM',
  SetCanvasMeasurement = 'SET_CANVAS_MEASUREMENT',
  RegisterCanvas = 'REGISTER_CANVAS',
  UnregisterCanvas = 'UNREGISTER_CANVAS',
}

export const setCanvasZoomAction = createAction<number>(CanvasConfigActionEnums.SetCanvasZoom);

export const setCanvasWidthAction = createAction<ICanvasWidthProps>(CanvasConfigActionEnums.SetCanvasWidth);

export const setScreenWidthAction = createAction<number>(CanvasConfigActionEnums.SetScreenWidth);

export const setDesignerDeviceAction = createAction<DeviceTypes>(CanvasConfigActionEnums.SetDesignerDevice);

export const setCanvasAutoZoomAction = createAction<boolean | undefined>(CanvasConfigActionEnums.SetCanvasAutoZoom);

// Turns the responsive "Canvas" width preset on/off (undefined toggles).
export const setCanvasAutoWidthAction = createAction<boolean | undefined>(CanvasConfigActionEnums.SetCanvasAutoWidth);

// Sizes the canvas to a percentage of the available space, and turns auto width on.
export const setCanvasWidthPercentAction = createAction<number>(CanvasConfigActionEnums.SetCanvasWidthPercent);

// Reports the width currently available to the canvas; only applied while auto width is on.
export const setAvailableCanvasWidthAction = createAction<ICanvasWidthMeasurement>(CanvasConfigActionEnums.SetAvailableCanvasWidth);

// Sets an explicit zoom value and switches the canvas into manual mode (disables auto-zoom).
export const setManualZoomAction = createAction<number>(CanvasConfigActionEnums.SetManualZoom);

// Reports the mounted canvas. Its absence is how a rendered page is told apart from the designer.
export const setCanvasMeasurementAction = createAction<ICanvasMeasurement>(CanvasConfigActionEnums.SetCanvasMeasurement);

// Mount/unmount of a canvas. Refcounted: the quick-edit dialog opens a second one over the first.
export const registerCanvasAction = createAction(CanvasConfigActionEnums.RegisterCanvas);
export const unregisterCanvasAction = createAction(CanvasConfigActionEnums.UnregisterCanvas);
