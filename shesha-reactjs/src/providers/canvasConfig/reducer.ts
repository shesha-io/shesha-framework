import { handleActions } from 'redux-actions';
import { CanvasConfigActionEnums } from './actions';
import { ICanvasConfigStateContext,CANVAS_CONFIG_CONTEXT_INITIAL_STATE } from './contexts';

export default handleActions<ICanvasConfigStateContext, any>(
  {
      [CanvasConfigActionEnums.SetCanvasWidth]: (state: ICanvasConfigStateContext, action: ReduxActions.Action<number>) => {
        const { payload } = action;

        return {
          ...state,
          width: payload,
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
