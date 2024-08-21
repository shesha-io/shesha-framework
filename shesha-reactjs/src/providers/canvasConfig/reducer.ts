import { handleActions } from 'redux-actions';
import { CanvasConfigActionEnums } from './actions';
import { ICanvasConfigStateContext, CANVAS_CONFIG_CONTEXT_INITIAL_STATE, ICanvasWidthProps, IDeviceTypes } from './contexts';

export default handleActions<ICanvasConfigStateContext, any>(
  {
    [CanvasConfigActionEnums.SetCanvasWidth]: (state: ICanvasConfigStateContext, action: ReduxActions.Action<ICanvasWidthProps>) => {
      const { payload: { width, deviceType } } = action;

      return {
        ...state,
        width,
        activeDevice: deviceType as IDeviceTypes,
      };
    },
    [CanvasConfigActionEnums.SetCanvasZoom]: (state: ICanvasConfigStateContext, action: ReduxActions.Action<number>) => {
      const { payload } = action;

      return {
        ...state,
        zoom: payload,
      };
    },
  },
  CANVAS_CONFIG_CONTEXT_INITIAL_STATE
);
