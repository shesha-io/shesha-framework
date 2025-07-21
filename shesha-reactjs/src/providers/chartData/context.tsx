import { IChartsProps, TAggregationMethod, TChartType, TDataMode, TLegendPosition, TTimeSeriesFormat } from "@/designer-components/charts/model";
import { FilterExpression } from "@/publicJsApis/dataTableContextApi";
import { createContext } from "react";

export interface IChartDataContext extends IChartsProps {
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
  legendPosition?: TLegendPosition;
  entityType?: string;
  valueProperty?: string;
  axisProperty?: string;
  isAxisTimeSeries?: boolean;
  timeSeriesFormat?: TTimeSeriesFormat;
  groupingProperty?: string;
  isGroupingTimeSeries?: boolean;
  groupingTimeSeriesFormat?: TTimeSeriesFormat;
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

  axisPropertyLabel?: string;
  valuePropertyLabel?: string;
  filters?: FilterExpression;
  
  // Font configuration properties
  titleFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
  axisLabelFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
  legendFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
  tickFont?: {
    family?: string;
    size?: number;
    weight?: string;
    color?: string;
  };
}

export interface IChartDataAtionsContext {
  setControlProps?: (controlProps: IChartsProps) => void;
  setData?: (data: object[]) => void;
  onFilter?: () => void;
  /** Sets the data that will be retrieved directly from the backend */
  setUrlTypeData?: (data: object) => void;

  setIsLoaded?: (isLoaded: boolean) => void;
  setIsFilterVisible?: (isFilterVisible: boolean) => void;
  cleanData?: () => void;
  setAxisPropertyLabel?: (axisPropertyLabel: string) => void;
  setValuePropertyLabel?: (valuePropertyLabel: string) => void;
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
  valueProperty: '',
  axisProperty: '',
  isAxisTimeSeries: false,
  timeSeriesFormat: 'month-year',
  groupingProperty: '',
  isGroupingTimeSeries: false,
  groupingTimeSeriesFormat: 'month-year',
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
  filters: {
    and: [],
  },

  data: [],
  items: [],
  urlTypeData: {},

  isLoaded: false,

  axisPropertyLabel: '',
  valuePropertyLabel: '',
  maxResultCount: -1,
  
  // Default font configurations
  titleFont: {
    family: 'Segoe UI',
    size: 16,
    weight: 'bold',
    color: '#000000'
  },
  axisLabelFont: {
    family: 'Segoe UI',
    size: 12,
    weight: 'bold',
    color: '#000000'
  },
  legendFont: {
    family: 'Segoe UI',
    size: 12,
    weight: '400',
    color: '#000000'
  },
  tickFont: {
    family: 'Segoe UI',
    size: 12,
    weight: '400',
    color: '#000000'
  },
};

export const ChartDataStateContext = createContext<IChartDataContext>(INITIAL_STATE);
export const ChartDataActionsContext = createContext<IChartDataAtionsContext>(undefined);