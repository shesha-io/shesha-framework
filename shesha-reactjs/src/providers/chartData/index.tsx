import { IChartProps } from "@/designer-components/charts/model";
import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from "react";
import { CleanDataAction, SetControlPropsAction, SetDataAction, SetIsLoadedAction, SetUrlTypeDataAction } from "./actions";
import { ChartDataActionsContext, ChartDataStateContext, INITIAL_STATE } from "./context";
import { chartDataReducer } from "./reducer";

interface IChartDataProviderProps {
  model: IChartProps;
}

const ChartDataProvider: FC<PropsWithChildren<IChartDataProviderProps>> = ({ children, model }) => {
    const { filters, ...propsWithoutFilters } = model;
  // Destructure filters from props to exclude it from the initial state
  const [state, dispatch] = useReducer(chartDataReducer, { ...INITIAL_STATE, ...propsWithoutFilters });

  function setControlProps(controlProps: IChartProps) {
    dispatch(SetControlPropsAction(controlProps));
  }

  useEffect(() => {
    dispatch(SetControlPropsAction(model));
  }, [model]);

  const setData = (data: object[]) => {
    dispatch(SetDataAction(data));
  };

  const setIsLoaded = (isLoaded: boolean) => {
    dispatch(SetIsLoadedAction(isLoaded));
  };

  const setUrlTypeData = (urlTypeData: object) => {
    dispatch(SetUrlTypeDataAction(urlTypeData));
  };

  const cleanData = () => {
    dispatch(CleanDataAction());
  };

  return (
    <ChartDataStateContext.Provider value={state}>
      <ChartDataActionsContext.Provider value={{
        setData,
        setIsLoaded,
        setControlProps,
        setUrlTypeData,
        cleanData
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

export default React.memo(ChartDataProvider);