import { IConfigurableFormComponent } from "@/providers";
import { FilterExpression } from "@/providers/dataTable/interfaces";
import { IBackgroundValue } from "../_settings/utils/background/interfaces";
import { IShadowValue } from "../_settings/utils/shadow/interfaces";
import { IBorderValue } from "../_settings/utils/border/interfaces";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { IDataSet } from "@/providers/chartData/context";

/**
 * Chart data that will go into the actual chart component from ChartJS
 */
export interface IChartData {
  labels: (string | number | object)[];
  datasets: IDataSet[];
}
/**
 * Chart props, used in the chart component and some of its children
 */
export interface IChartsProps {
  width?: number | undefined;
  height?: number | undefined;
  orderBy?: string | undefined;
  orderDirection?: TOrderDirection | undefined;
  dataMode?: TDataMode | undefined;
  url?: string | undefined;
  additionalProperties?: Array<{ key: string; value: string }> | undefined;
  chartType?: TChartType | undefined;
  isDoughnut?: boolean | undefined;
  showTitle?: boolean | undefined;
  title?: string | undefined;
  name?: string | undefined;
  description?: string | undefined;
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
  allowFilter?: boolean | undefined;
  filterProperties?: string[] | undefined;
  xProperty?: string | undefined;
  yProperty?: string | undefined;
  tension?: number | undefined;
  borderWidth?: number | undefined; // for migration
  strokeWidth?: number | undefined;
  strokeColor?: string | undefined;
  simpleOrPivot?: 'simple' | 'pivot' | undefined;
  showName?: boolean | undefined;
  showDescription?: boolean | undefined;
  showXAxisScale?: boolean | undefined;
  showXAxisTitle?: boolean | undefined;
  showYAxisScale?: boolean | undefined;
  showYAxisTitle?: boolean | undefined;
  stacked?: boolean | undefined;
  aggregationMethod?: TAggregationMethod | undefined;
  filters?: FilterExpression | FilterExpression[] | undefined;

  axisPropertyLabel?: string | undefined;
  valuePropertyLabel?: string | undefined;
  maxResultCount?: number | undefined;
  requestTimeout?: number | undefined; // Timeout in milliseconds (default: 5000)

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

/**
 * Chart props, used in the Shesha tool box
 */
export interface IChartProps extends IConfigurableFormComponent, IChartsProps {
  hidden?: boolean | undefined;

  border?: IBorderValue | undefined;
  shadow?: IShadowValue | undefined;
  background?: IBackgroundValue | undefined;
}

export interface IChartDataProps extends IChartsProps {
  labels?: string[];
  chartData?: number[];
  data?: IChartData;
}

export type TDataMode = 'url' | 'entityType';

export type TChartType = 'polarArea' | 'bar' | 'line' | 'pie';

export type TAggregationMethod = 'count' | 'sum' | 'average' | 'min' | 'max';

export type TLegendPosition = 'top' | 'bottom' | 'left' | 'right';

export type TTimeSeriesFormat = 'day' | 'month' | 'year' | 'day-month' | 'day-month-year' | 'month-year';

export type TOrderDirection = 'asc' | 'desc';

/**
 * To be used in the filter component
 */
export type TOperator =
  'equals' |
  'not_equals' |
  'contains' |
  'does_not_contain' |
  'is_empty' |
  'is_not_empty' |
  'is_greater_than' |
  'is_less_than' |
  'is_greater_than_or_equals' |
  'is_less_than_or_equals' |
  'starts_with' |
  'ends_with' |
  'is' |
  'is_not';
