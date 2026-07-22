import { IChartsProps } from '@/designer-components/charts/model';
import { createAction } from '@reduxjs/toolkit';

export enum ChartDataActionsEnum {
  SetData = "SET_DATA",
  SetIsLoaded = "SET_IS_LOADED",
  SetIsFilterVisible = "SET_IS_FILTER_VISIBLE",
  SetControlProps = "SET_CONTROL_PROPS",
  SetUrlTypeData = "SET_URL_TYPE_DATA",
  CleanData = "CLEAN_DATA",
  SetAxisPropertyLabel = "SET_AXIS_LABEL",
  SetValuePropertyLabel = "SET_VALUE_LABEL",
}

export const SetDataAction = createAction<object[]>(ChartDataActionsEnum.SetData);

export const SetIsLoadedAction = createAction<boolean>(ChartDataActionsEnum.SetIsLoaded);

export const SetControlPropsAction = createAction<IChartsProps>(ChartDataActionsEnum.SetControlProps);

export const SetUrlTypeDataAction = createAction<object>(ChartDataActionsEnum.SetUrlTypeData);

export const CleanDataAction = createAction(ChartDataActionsEnum.CleanData);

export const SetAxisPropertyLabelAction = createAction<string>(ChartDataActionsEnum.SetAxisPropertyLabel);

export const SetValuePropertyLabelAction = createAction<string>(ChartDataActionsEnum.SetValuePropertyLabel);
