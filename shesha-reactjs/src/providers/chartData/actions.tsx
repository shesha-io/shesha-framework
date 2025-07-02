import { createAction } from "redux-actions";

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

export const SetDataAction = createAction(ChartDataActionsEnum.SetData, (data: object[]) => ({ data, items: data }));

export const SetIsLoadedAction = createAction(ChartDataActionsEnum.SetIsLoaded, (isLoaded: boolean) => ({ isLoaded }));

export const SetControlPropsAction = createAction(ChartDataActionsEnum.SetControlProps, (controlProps: object) => ({ ...controlProps }));

export const SetUrlTypeDataAction = createAction(ChartDataActionsEnum.SetUrlTypeData, (urlTypeData: object) => ({ urlTypeData }));

export const CleanDataAction = createAction(ChartDataActionsEnum.CleanData, () => ({}));

export const SetAxisPropertyLabelAction = createAction(ChartDataActionsEnum.SetAxisPropertyLabel, (axisPropertyLabel: string) => ({ axisPropertyLabel }));

export const SetValuePropertyLabelAction = createAction(ChartDataActionsEnum.SetValuePropertyLabel, (valuePropertyLabel: string) => ({ valuePropertyLabel }));