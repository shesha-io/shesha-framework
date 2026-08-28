import { createAction } from '@reduxjs/toolkit';
import { ICanvasWidthProps, DeviceTypes, IViewType } from './contexts';

export enum CanvasConfigActionEnums {
  SetCanvasWidth = 'SET_FORM_WIDTH',
  SetCanvasZoom = 'SET_FORM_ZOOM',
  SetDesignerDevice = 'SET_DESIGNER_DEVICE',
  SetScreenWidth = 'SET_SCREEN_WIDTH',
  SetCanvasAutoZoom = 'SET_AUTO_ZOOM',
  SetCanvasAutoWidth = 'SET_AUTO_WIDTH',
  SetAvailableCanvasWidth = 'SET_AVAILABLE_CANVAS_WIDTH',
  SetManualZoom = 'SET_MANUAL_ZOOM',
  SetConfigTreePanelSize = 'SET_CONFIG_TREE_PANEL_SIZE',
  SetViewType = 'SET_VIEW_TYPE',
}

export const setCanvasZoomAction = createAction<number>(CanvasConfigActionEnums.SetCanvasZoom);

export const setCanvasWidthAction = createAction<ICanvasWidthProps>(CanvasConfigActionEnums.SetCanvasWidth);

export const setScreenWidthAction = createAction<number>(CanvasConfigActionEnums.SetScreenWidth);

export const setDesignerDeviceAction = createAction<DeviceTypes>(CanvasConfigActionEnums.SetDesignerDevice);

export const setCanvasAutoZoomAction = createAction<boolean | undefined>(CanvasConfigActionEnums.SetCanvasAutoZoom);

// Turns the responsive "Canvas" width preset on/off (undefined toggles).
export const setCanvasAutoWidthAction = createAction<boolean | undefined>(CanvasConfigActionEnums.SetCanvasAutoWidth);

export interface ISetAvailableCanvasWidthPayload {
  /**
   * Width the canvas is laid out at - in "Canvas" mode the pane width divided by the zoom factor,
   * so that once CSS zoom is applied the canvas renders exactly as wide as its pane. Becomes
   * `designerWidth`.
   */
  width: string;
  /**
   * Unzoomed width of the pane, i.e. the space the canvas actually has on screen.
   *
   * Carried separately from `width` because the two answer different questions and only this one
   * may pick the device - see the reducer. Optional so a caller passing a width alone still works;
   * the reducer then falls back to reading the device off `width`.
   */
  paneWidth?: number | undefined;
}

// Reports the width currently available to the canvas; only applied while auto width is on.
export const setAvailableCanvasWidthAction = createAction<ISetAvailableCanvasWidthPayload>(CanvasConfigActionEnums.SetAvailableCanvasWidth);

// Sets an explicit zoom value and switches the canvas into manual mode (disables auto-zoom).
export const setManualZoomAction = createAction<number>(CanvasConfigActionEnums.SetManualZoom);

export const setConfigTreePanelSizeAction = createAction<number>(CanvasConfigActionEnums.SetConfigTreePanelSize);

export const setViewTypeAction = createAction<IViewType>(CanvasConfigActionEnums.SetViewType);
