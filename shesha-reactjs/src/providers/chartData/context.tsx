import { IChartsProps, TAggregationMethod, TChartType, TDataMode, TTimeSeriesFormat } from "@/designer-components/charts/model";
import { createContext } from "react";

export interface IChartDataContext {
  height?: number;
  width?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  url?: string;
  dataMode?: TDataMode;
  chartType?: TChartType;
  isDoughnut?: boolean;
  showTitle?: boolean;
  title?: string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  entityType?: string;
  filters?: {
    and?: [];
  };
  valueProperty?: string;
  axisProperty?: string;
  isAxisTimeSeries?: boolean;
  timeSeriesFormat?: TTimeSeriesFormat;
  legendProperty?: string;
  filterProperties?: string[];
  xProperty?: string;
  yProperty?: string;
  simpleOrPivot?: 'simple' | 'pivot';
  showXAxisScale?: boolean;
  showXAxisTitle?: boolean;
  showYAxisScale?: boolean;
  showYAxisTitle?: boolean;
  stacked?: boolean;
  aggregationMethod?: TAggregationMethod;
  tension?: number;
  strokeWidth?: number;
  strokeColor?: string;

  data?: object[];
  items?: object[];
  urlTypeData?: {
    labels?: string[];
    datasets?: object[];
  };

  isLoaded?: boolean;

  filteredData?: object[];
}

export interface IChartDataAtionsContext {
  setControlProps?: (controlProps: IChartsProps) => void;
  setData?: (data: object[]) => void;
  setFilterdData?: (data: object[]) => void;
  onFilter?: () => void;
  /** Sets the data that will be retrieved directly from the backend */
  setUrlTypeData?: (data: object) => void;

  setIsLoaded?: (isLoaded: boolean) => void;
  setIsFilterVisible?: (isFilterVisible: boolean) => void;
}

export const INITIAL_STATE: IChartDataContext = {
  height: 0,
  url: '',
  dataMode: 'entityType',
  chartType: 'line',
  showTitle: true,
  title: '',
  showLegend: true,
  legendPosition: 'top',
  entityType: 'entity',
  filters: {},
  valueProperty: 'value',
  axisProperty: 'axis',
  isAxisTimeSeries: false,
  timeSeriesFormat: 'day-month-year',
  legendProperty: 'legend',
  xProperty: 'x',
  yProperty: 'y',
  simpleOrPivot: 'simple',
  showXAxisScale: true,
  showXAxisTitle: true,
  showYAxisScale: true,
  showYAxisTitle: true,
  aggregationMethod: 'count',
  tension: 0,
  strokeWidth: 0,

  data: [],
  items: [],
  urlTypeData: {},

  isLoaded: false,

  filteredData: [],
};

export const ChartDataStateContext = createContext<IChartDataContext>(INITIAL_STATE);
export const ChartDataActionsContext = createContext<IChartDataAtionsContext>(undefined);