import React, { useContext, useReducer, PropsWithChildren, FC } from "react";
import { ChartDataActionsContext, ChartDataStateContext, INITIAL_STATE } from "./context";
import { chartDataReducer } from "./reducer";
import { SetChartFiltersAction, SetControlPropsAction, SetDataAction, SetFilterdDataAction, SetIsFilterVisibleAction, SetIsLoadedAction, SetRefListsAction } from "./actions";
import { IChartData, IChartsProps, IFilter } from "@/designer-components/charts/model";
import { IRefListPropertyMetadata } from "@/interfaces/metadata";

const ChartDataProvider: FC<PropsWithChildren<{}>> = ({ children }: PropsWithChildren<{}>) => {
  const [state, dispatch] = useReducer(chartDataReducer, INITIAL_STATE);

  const setData = (data: IChartData[]) => {
    dispatch(SetDataAction(data));
  };

  const setRefLists = (refLists?: { [key: string]: IRefListPropertyMetadata[] }) => {
    dispatch(SetRefListsAction(refLists));
  };

  const setFilterdData = (filteredData: object[]) => {
    dispatch(SetFilterdDataAction(filteredData));
  };

  const setChartFilters = (filters: IFilter[]) => {
    dispatch(SetChartFiltersAction(filters));
  };

  const setIsLoaded = (isLoaded: boolean) => {
    dispatch(SetIsLoadedAction(isLoaded));
  };

  const setIsFilterVisible = (isFilterVisible: boolean) => {
    dispatch(SetIsFilterVisibleAction(isFilterVisible));
  };

  const setControlProps = (controlProps: IChartsProps) => {
    dispatch(SetControlPropsAction(controlProps));
  };

  return (
    <ChartDataStateContext.Provider value={state}>
      <ChartDataActionsContext.Provider value={{
        setData,
        setRefLists,
        setFilterdData,
        setChartFilters,
        setIsLoaded,
        setIsFilterVisible,
        setControlProps
      }}>
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