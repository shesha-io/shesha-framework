import { IChartsProps, IChartProps } from "@/designer-components/charts/model";
import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useReducer } from "react";
import { CleanDataAction, SetAxisPropertyLabelAction, SetControlPropsAction, SetDataAction, SetIsLoadedAction, SetUrlTypeDataAction, SetValuePropertyLabelAction } from "./actions";
import { ChartDataActionsContext, ChartDataStateContext, IChartDataAtionsContext, IChartDataContext, INITIAL_STATE } from "./context";
import { chartDataReducer } from "./reducer";
import { throwError } from "@/utils/errors";

interface IChartDataProviderProps {
  model: IChartProps;
}

const ChartDataProvider: FC<PropsWithChildren<IChartDataProviderProps>> = ({ children, model }) => {
  const [state, dispatch] = useReducer(chartDataReducer, { ...INITIAL_STATE, ...model });

  const setControlProps = (controlProps: IChartsProps): void => {
    dispatch(SetControlPropsAction(controlProps));
  };

  useEffect(() => {
    dispatch(SetControlPropsAction(model));
  }, [model]);

  const setData = useCallback((data: object[]): void => {
    dispatch(SetDataAction(data));
  }, [dispatch]);

  const setIsLoaded = useCallback((isLoaded: boolean): void => {
    dispatch(SetIsLoadedAction(isLoaded));
  }, [dispatch]);

  const setUrlTypeData = useCallback((urlTypeData: object): void => {
    dispatch(SetUrlTypeDataAction(urlTypeData));
  }, [dispatch]);

  const cleanData = useCallback((): void => {
    dispatch(CleanDataAction());
  }, [dispatch]);

  const setAxisPropertyLabel = useCallback((axisPropertyLabel: string): void => {
    dispatch(SetAxisPropertyLabelAction(axisPropertyLabel));
  }, [dispatch]);

  const setValuePropertyLabel = useCallback((valuePropertyLabel: string): void => {
    dispatch(SetValuePropertyLabelAction(valuePropertyLabel));
  }, [dispatch]);

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
        onFilter: () => { },
        setIsFilterVisible: () => { },
      }}
      >
        {children}
      </ChartDataActionsContext.Provider>
    </ChartDataStateContext.Provider>
  );
};

export const useChartDataStateContext = (): IChartDataContext => useContext(ChartDataStateContext) ?? throwError("useChartDataStateContext must be used within a ChartDataProvider");

export const useChartDataActionsContext = (): IChartDataAtionsContext => useContext(ChartDataActionsContext) ?? throwError("useChartDataActionsContext must be used within a ChartDataProvider");

export default React.memo(ChartDataProvider);
