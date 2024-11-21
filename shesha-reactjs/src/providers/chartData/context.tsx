import { IChartsProps, IFilter, TDataMode, TTimeSeriesFormat } from "@/designer-components/charts/model";
import { createContext } from "react";

export interface IChartDataContext {
  height?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  url?: string;
  dataMode?: TDataMode;
  chartType?: 'pivot' | 'bar' | 'line' | 'pie' | 'timebased';
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
  aggregationMethod?: 'count' | 'sum' | 'average' | 'min' | 'max';
  tension?: number;
  borderWidth?: number;
  strokeColor?: string;

  data?: object[];
  items?: object[];
  urlTypeData?: object;

  isLoaded?: boolean;

  chartFilters?: IFilter[];
  filteredData?: object[];
  isFilterVisible?: boolean;
}

export interface IChartDataAtionsContext {
  setControlProps?: (controlProps: IChartsProps) => void;
  setData?: (data: object[]) => void;
  setFilterdData?: (data: object[]) => void;
  setChartFilters?: (filters: IFilter[]) => void;
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
  chartType: 'pivot',
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
  borderWidth: 0,

  data: [],
  items: [],
  urlTypeData: {},

  isLoaded: false,

  chartFilters: [],
  filteredData: [],
  isFilterVisible: false,
};

export const ChartDataStateContext = createContext<IChartDataContext>(INITIAL_STATE);
export const ChartDataActionsContext = createContext<IChartDataAtionsContext>(undefined);