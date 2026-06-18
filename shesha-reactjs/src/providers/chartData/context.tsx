import { IChartsProps, TAggregationMethod, TChartType, TDataMode, TLegendPosition, TTimeSeriesFormat } from "@/designer-components/charts/model";
import { FilterExpression } from "@/providers/dataTable/interfaces";
import { createContext } from "react";
import { IEntityTypeIdentifier } from "../sheshaApplication/publicApi/entities/models";
import { IAnyObject } from "@/interfaces";

export type IDataSet = IAnyObject & {
  borderColor?: string | undefined;
  borderWidth?: number | undefined;
  strokeColor?: string | undefined;
  tension?: number | undefined;
  data?: unknown[] | undefined;
  pointRadius?: number;
  label?: string | undefined;
  backgroundColor?: string | undefined;
};

export interface IChartDataContext extends IChartsProps {
  height?: number | undefined;
  width?: number | undefined;
  orderBy?: string | undefined;
  orderDirection?: 'asc' | 'desc' | undefined;
  url?: string | undefined;
  dataMode?: TDataMode | undefined;
  chartType?: TChartType | undefined;
  isDoughnut?: boolean | undefined;
  showTitle?: boolean | undefined;
  title?: string | undefined;
  showLegend?: boolean | undefined;
  legendPosition?: TLegendPosition | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  valueProperty?: string | undefined;
  axisProperty?: string | undefined;
  isAxisTimeSeries?: boolean | undefined;
  timeSeriesFormat?: TTimeSeriesFormat | undefined;
  groupingProperty?: string | undefined;
  isGroupingTimeSeries?: boolean | undefined;
  groupingTimeSeriesFormat?: TTimeSeriesFormat | undefined;
  filterProperties?: string[] | undefined;
  xProperty?: string | undefined;
  yProperty?: string | undefined;
  simpleOrPivot?: 'simple' | 'pivot' | undefined;
  showXAxisScale?: boolean | undefined;
  showXAxisTitle?: boolean | undefined;
  showYAxisScale?: boolean | undefined;
  showYAxisTitle?: boolean | undefined;
  stacked?: boolean | undefined;
  aggregationMethod?: TAggregationMethod | undefined;
  tension?: number | undefined;
  strokeWidth?: number | undefined;
  strokeColor?: string | undefined;

  data?: IAnyObject[] | undefined;
  items?: object[] | undefined;
  urlTypeData?: {
    labels?: string[] | undefined;
    datasets?: IDataSet[] | undefined;
  } | undefined;

  isLoaded?: boolean | undefined;

  axisPropertyLabel?: string | undefined;
  valuePropertyLabel?: string | undefined;
  filters?: FilterExpression | FilterExpression[] | undefined;

  // Font configuration properties
  titleFont?: {
    family?: string | undefined;
    size?: number | undefined;
    weight?: string | undefined;
    color?: string | undefined;
  } | undefined;
  axisLabelFont?: {
    family?: string | undefined;
    size?: number | undefined;
    weight?: string | undefined;
    color?: string | undefined;
  } | undefined;
  legendFont?: {
    family?: string | undefined;
    size?: number | undefined;
    weight?: string | undefined;
    color?: string | undefined;
  } | undefined;
  tickFont?: {
    family?: string | undefined;
    size?: number | undefined;
    weight?: string | undefined;
    color?: string | undefined;
  } | undefined;
}

export interface IChartDataAtionsContext {
  setControlProps: (controlProps: IChartsProps) => void;
  setData: (data: object[]) => void;
  onFilter: () => void;
  /** Sets the data that will be retrieved directly from the backend */
  setUrlTypeData: (data: object) => void;

  setIsLoaded: (isLoaded: boolean) => void;
  setIsFilterVisible: (isFilterVisible: boolean) => void;
  cleanData: () => void;
  setAxisPropertyLabel: (axisPropertyLabel: string) => void;
  setValuePropertyLabel: (valuePropertyLabel: string) => void;
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
    color: '#000000',
  },
  axisLabelFont: {
    family: 'Segoe UI',
    size: 12,
    weight: 'bold',
    color: '#000000',
  },
  legendFont: {
    family: 'Segoe UI',
    size: 12,
    weight: '400',
    color: '#000000',
  },
  tickFont: {
    family: 'Segoe UI',
    size: 12,
    weight: '400',
    color: '#000000',
  },
};

export const ChartDataStateContext = createContext<IChartDataContext | undefined>(undefined);
export const ChartDataActionsContext = createContext<IChartDataAtionsContext | undefined>(undefined);
