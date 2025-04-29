import { IChartData, IChartsProps } from "@/designer-components/charts/model";
import React, { FC, PropsWithChildren, useContext, useMemo, useReducer } from "react";
import { SetControlPropsAction, SetDataAction, SetFilterdDataAction, SetIsLoadedAction, SetUrlTypeDataAction } from "./actions";
import { ChartDataActionsContext, ChartDataStateContext, INITIAL_STATE } from "./context";
import { chartDataReducer } from "./reducer";

const ChartDataProvider: FC<PropsWithChildren<{}>> = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(chartDataReducer, INITIAL_STATE);

  const setData = (data: IChartData[]) => {
    dispatch(SetDataAction(data));
  };

  const setFilterdData = (filteredData: object[]) => {
    dispatch(SetFilterdDataAction(filteredData));
  };

  const setIsLoaded = (isLoaded: boolean) => {
    dispatch(SetIsLoadedAction(isLoaded));
  };

  const setControlProps = (controlProps: IChartsProps) => {
    dispatch(SetControlPropsAction(controlProps));
  };

  const setUrlTypeData = (urlTypeData: object) => {
    dispatch(SetUrlTypeDataAction(urlTypeData));
  };

  return (
    <ChartDataStateContext.Provider value={state}>
      <ChartDataActionsContext.Provider value={useMemo(() => ({
        setData,
        setFilterdData,
        setIsLoaded,
        setControlProps,
        setUrlTypeData
      }), [])}>
        {children}
      </ChartDataActionsContext.Provider>
    </ChartDataStateContext.Provider>
  );
};

export const useChartDataStateContext = () => {
  const context = useContext(ChartDataStateContext);
  if (!context) {
    throw new Error("useChartDataStateContext must be used within a ChartDataProvider");
  }
  return context;
};

export const useChartDataActionsContext = () => {
  const context = useContext(ChartDataActionsContext);
  if (!context) {
    throw new Error("useChartDataActionsContext must be used within a ChartDataProvider");
  }
  return context;
};

export default ChartDataProvider;