import { IChartProps } from "@/designer-components/charts/model";
import React, { FC, PropsWithChildren, useContext, useEffect, useReducer } from "react";
import { CleanDataAction, SetAxisPropertyLabelAction, SetControlPropsAction, SetDataAction, SetIsLoadedAction, SetUrlTypeDataAction, SetValuePropertyLabelAction } from "./actions";
import { ChartDataActionsContext, ChartDataStateContext, IChartDataAtionsContext, IChartDataContext, INITIAL_STATE } from "./context";
import { chartDataReducer } from "./reducer";

interface IChartDataProviderProps {
  model: IChartProps;
}

const ChartDataProvider: FC<PropsWithChildren<IChartDataProviderProps>> = ({ children, model }) => {
  const [state, dispatch] = useReducer(chartDataReducer, { ...INITIAL_STATE, ...model });

  const setControlProps = (controlProps: IChartProps): void => {
    dispatch(SetControlPropsAction(controlProps));
  };

  useEffect(() => {
    dispatch(SetControlPropsAction(model));
  }, [model]);

  const setData = (data: object[]): void => {
    dispatch(SetDataAction(data));
  };

  const setIsLoaded = (isLoaded: boolean): void => {
    dispatch(SetIsLoadedAction(isLoaded));
  };

  const setUrlTypeData = (urlTypeData: object): void => {
    dispatch(SetUrlTypeDataAction(urlTypeData));
  };

  const cleanData = (): void => {
    dispatch(CleanDataAction());
  };

  const setAxisPropertyLabel = (axisPropertyLabel: string): void => {
    dispatch(SetAxisPropertyLabelAction(axisPropertyLabel));
  };

  const setValuePropertyLabel = (valuePropertyLabel: string): void => {
    dispatch(SetValuePropertyLabelAction(valuePropertyLabel));
  };

  return (
    <ChartDataStateContext.Provider value={state}>
      <ChartDataActionsContext.Provider value={{
        setData,
        setIsLoaded,
        setControlProps,
        setUrlTypeData,
        cleanData,
        setAxisPropertyLabel,
        setValuePropertyLabel,
      }}
      >
        {children}
      </ChartDataActionsContext.Provider>
    </ChartDataStateContext.Provider>
  );
};

export const useChartDataStateContext = (): IChartDataContext => {
  const context = useContext(ChartDataStateContext);
  if (!context) {
    throw new Error("useChartDataStateContext must be used within a ChartDataProvider");
  }
  return context;
};

export const useChartDataActionsContext = (): IChartDataAtionsContext => {
  const context = useContext(ChartDataActionsContext);
  if (!context) {
    throw new Error("useChartDataActionsContext must be used within a ChartDataProvider");
  }
  return context;
};

export default React.memo(ChartDataProvider);
