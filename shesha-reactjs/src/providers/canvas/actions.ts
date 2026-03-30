import { createAction } from '@reduxjs/toolkit';
import { ICanvasWidthProps, IDeviceTypes, IViewType } from './contexts';

export enum CanvasConfigActionEnums {
  SetCanvasWidth = 'SET_FORM_WIDTH',
  SetCanvasZoom = 'SET_FORM_ZOOM',
  SetDesignerDevice = 'SET_DESIGNER_DEVICE',
  SetScreenWidth = 'SET_SCREEN_WIDTH',
  SetCanvasAutoZoom = 'SET_AUTO_ZOOM',
  SetConfigTreePanelSize = 'SET_CONFIG_TREE_PANEL_SIZE',
  SetViewType = 'SET_VIEW_TYPE',
}

export const setCanvasZoomAction = createAction<number>(CanvasConfigActionEnums.SetCanvasZoom);

export const setCanvasWidthAction = createAction<ICanvasWidthProps>(CanvasConfigActionEnums.SetCanvasWidth);

export const setScreenWidthAction = createAction<number>(CanvasConfigActionEnums.SetScreenWidth);

export const setDesignerDeviceAction = createAction<IDeviceTypes>(CanvasConfigActionEnums.SetDesignerDevice);

export const setCanvasAutoZoomAction = createAction(CanvasConfigActionEnums.SetCanvasAutoZoom);

export const setConfigTreePanelSizeAction = createAction<number>(CanvasConfigActionEnums.SetConfigTreePanelSize);

export const setViewTypeAction = createAction<IViewType>(CanvasConfigActionEnums.SetViewType);
