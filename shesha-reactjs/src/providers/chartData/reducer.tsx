import { handleActions } from "redux-actions";
import { ChartDataActionsEnum } from "./actions";
import { INITIAL_STATE } from "./context";

export const chartDataReducer = handleActions(
  {
    [ChartDataActionsEnum.SetData]: (state, action) => ({
      ...state,
      ...action.payload,
    }),

    [ChartDataActionsEnum.SetIsFilterVisible]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ChartDataActionsEnum.SetIsLoaded]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ChartDataActionsEnum.SetControlProps]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ChartDataActionsEnum.SetUrlTypeData]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    
    [ChartDataActionsEnum.CleanData]: () => ({
      ...INITIAL_STATE,
    }),
  },
  INITIAL_STATE,
);