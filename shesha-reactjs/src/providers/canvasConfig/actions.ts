import { createAction } from 'redux-actions';

export enum CanvasConfigActionEnums {
  SetCanvasWidth= 'SET_FORM_WIDTH',
  SetCanvasZoom= 'SET_FORM_ZOOM',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setCanvasZoomAction = createAction<number, number>(CanvasConfigActionEnums.SetCanvasZoom, (p) => p);

export const setCanvasWidthAction = createAction<number, number>(CanvasConfigActionEnums.SetCanvasWidth, (p) => p);
/* NEW_ACTION_GOES_HERE */
