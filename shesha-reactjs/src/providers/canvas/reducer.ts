import { handleActions } from 'redux-actions';
import { CanvasConfigActionEnums } from './actions';
import { ICanvasStateContext, CANVAS_CONTEXT_INITIAL_STATE, ICanvasWidthProps, IDeviceTypes } from './contexts';
import { getDeviceTypeByWidth, getSmallerDevice, getWidthByDeviceType } from './utils';

export default handleActions<ICanvasStateContext, any>(
  {
    [CanvasConfigActionEnums.SetScreenWidth]: (state: ICanvasStateContext, action: ReduxActions.Action<number>) => {
      const { payload: width } = action;
      const device = getDeviceTypeByWidth(width);
      return {
        ...state,
        physicalDevice: device,
        activeDevice: getSmallerDevice(device, state.designerDevice),
      };
    },
    [CanvasConfigActionEnums.SetDesignerDevice]: (state: ICanvasStateContext, action: ReduxActions.Action<IDeviceTypes>) => {
      const { payload: deviceType } = action;

      return {
        ...state,
        designerWidth: state.designerWidth ?? getWidthByDeviceType(deviceType),
        designerDevice: deviceType,
        activeDevice: getSmallerDevice(deviceType, state.physicalDevice),
      };
    },
    [CanvasConfigActionEnums.SetCanvasWidth]: (state: ICanvasStateContext, action: ReduxActions.Action<ICanvasWidthProps>) => {
      const { payload: { width, deviceType } } = action;

      return {
        ...state,
        designerWidth: typeof width === 'string' ? width : `${width}px`,
        designerDevice: deviceType as IDeviceTypes,
      };
    },
    [CanvasConfigActionEnums.SetCanvasZoom]: (state: ICanvasStateContext, action: ReduxActions.Action<number>) => {
      const { payload } = action;

      return {
        ...state,
        zoom: payload,
      };
    },
    [CanvasConfigActionEnums.SetCanvasAutoZoom]: (state: ICanvasStateContext) => {
      return {
        ...state,
        autoZoom: !state.autoZoom,
      };
    },
    [CanvasConfigActionEnums.SetConfigTreePanelSize]: (state: ICanvasStateContext, action: ReduxActions.Action<number>) => {
      const { payload } = action;
      return {
        ...state,
        configTreePanelSize: payload,
      };
    },
  },
  CANVAS_CONTEXT_INITIAL_STATE
);
