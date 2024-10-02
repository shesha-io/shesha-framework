import { handleActions } from "redux-actions";
import { ChartDataActionsEnum } from "./actions";
import { INITIAL_STATE } from "./context";

// SetData = "SET_DATA",
//   SetRefLists = "SET_REF_LISTS",
//   SetFilterdData = "SET_FILTERED_DATA",
//   SetChartFilters = "SET_CHART_FILTERS",
//   SetIsLoaded = "SET_IS_LOADED",
//   SetIsFilterVisible = "SET_IS_FILTER_VISIBLE",
export const chartDataReducer = handleActions(
  {
    [ChartDataActionsEnum.SetChartFilters]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ChartDataActionsEnum.SetData]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ChartDataActionsEnum.SetFilterdData]: (state, action) => ({
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
    [ChartDataActionsEnum.SetRefLists]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
    [ChartDataActionsEnum.SetControlProps]: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
  INITIAL_STATE,
);