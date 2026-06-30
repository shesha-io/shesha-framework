import {
  SetDataAction,
  SetIsLoadedAction,
  SetControlPropsAction,
  SetUrlTypeDataAction,
  CleanDataAction,
  SetAxisPropertyLabelAction,
  SetValuePropertyLabelAction,
} from "./actions";
import { INITIAL_STATE } from "./context";
import { createReducer } from '@reduxjs/toolkit';

export const chartDataReducer = createReducer(INITIAL_STATE, (builder) => {
  builder
    .addCase(SetDataAction, (state, { payload }) => {
      return {
        ...state,
        items: payload,
      };
    })
    .addCase(SetIsLoadedAction, (state, { payload }) => {
      state.isLoaded = payload;
    })
    .addCase(SetControlPropsAction, (state, { payload }) => {
      return {
        ...state, ...payload,
      };
    })
    .addCase(SetUrlTypeDataAction, (state, { payload }) => {
      return {
        ...state,
        urlTypeData: payload,
      };
    })
    .addCase(CleanDataAction, (state) => {
      return {
        ...state,
        items: [],
      };
    })
    .addCase(SetAxisPropertyLabelAction, (state, { payload }) => {
      state.axisPropertyLabel = payload;
    })
    .addCase(SetValuePropertyLabelAction, (state, { payload }) => {
      state.valuePropertyLabel = payload;
    })
  ;
});
