import { IChartData, IFilter } from "@/designer-components/charts/model";
import { createAction } from "redux-actions";

export enum ChartDataActionsEnum {
    SetData = "SET_DATA",
    SetRefLists = "SET_REF_LISTS",
    SetFilterdData = "SET_FILTERED_DATA",
    SetChartFilters = "SET_CHART_FILTERS",
    SetIsLoaded = "SET_IS_LOADED",
    SetIsFilterVisible = "SET_IS_FILTER_VISIBLE",
    SetControlProps = "SET_CONTROL_PROPS",
}

export const SetDataAction = createAction(ChartDataActionsEnum.SetData, (data: IChartData[]) => ({ data, items: data }));

export const SetRefListsAction = createAction(ChartDataActionsEnum.SetRefLists, (refLists: { [key: string]: any[] }) => ({ refLists }));

export const SetFilterdDataAction = createAction(ChartDataActionsEnum.SetFilterdData, (filteredData: object[]) => ({ filteredData }));

export const SetChartFiltersAction = createAction(ChartDataActionsEnum.SetChartFilters, (chartFilters: IFilter[]) => ({ chartFilters }));

export const SetIsLoadedAction = createAction(ChartDataActionsEnum.SetIsLoaded, (isLoaded: boolean) => ({ isLoaded }));

export const SetIsFilterVisibleAction = createAction(ChartDataActionsEnum.SetIsFilterVisible, (isFilterVisible: boolean) => ({ isFilterVisible }));

export const SetControlPropsAction = createAction(ChartDataActionsEnum.SetControlProps, (controlProps: object) => ({ ...controlProps }));