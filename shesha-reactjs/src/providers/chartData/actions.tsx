import { IChartData } from "@/designer-components/charts/model";
import { createAction } from "redux-actions";

export enum ChartDataActionsEnum {
    SetData = "SET_DATA",
    SetFilterdData = "SET_FILTERED_DATA",
    SetChartFilters = "SET_CHART_FILTERS",
    SetIsLoaded = "SET_IS_LOADED",
    SetIsFilterVisible = "SET_IS_FILTER_VISIBLE",
    SetControlProps = "SET_CONTROL_PROPS",
    SetUrlTypeData = "SET_URL_TYPE_DATA",
}

export const SetDataAction = createAction(ChartDataActionsEnum.SetData, (data: IChartData[]) => ({ data, items: data }));

export const SetFilterdDataAction = createAction(ChartDataActionsEnum.SetFilterdData, (filteredData: object[]) => ({ filteredData }));

export const SetIsLoadedAction = createAction(ChartDataActionsEnum.SetIsLoaded, (isLoaded: boolean) => ({ isLoaded }));

export const SetControlPropsAction = createAction(ChartDataActionsEnum.SetControlProps, (controlProps: object) => ({ ...controlProps }));

export const SetUrlTypeDataAction = createAction(ChartDataActionsEnum.SetUrlTypeData, (urlTypeData: object) => ({ urlTypeData }));