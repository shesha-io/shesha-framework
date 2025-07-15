import { IConfigurableFormComponent } from "@/providers";
import { FilterExpression } from "@/providers/dataTable/interfaces";
import { IBackgroundValue } from "../_settings/utils/background/interfaces";
import { IShadowValue } from "../_settings/utils/shadow/interfaces";
import { IBorderValue } from "../_settings/utils/border/interfaces";

/**
 * Chart data that will go into the actual chart component from ChartJS
 */
export interface IChartData {
    labels: (string | number | object)[];
    datasets: object[];
}
/**
 * Chart props, used in the chart component and some of its children
 */
export interface IChartsProps {
    width?: number;
    height?: number;
    orderBy?: string;
    orderDirection?: TOrderDirection;
    dataMode?: TDataMode;
    url?: string;
    additionalProperties?: Array<{ key: string; value: string }>;
    chartType?: TChartType;
    isDoughnut?: boolean;
    showTitle?: boolean;
    title?: string;
    name?: string;
    description?: string;
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
    allowFilter?: boolean;
    filterProperties?: string[];
    xProperty?: string;
    yProperty?: string;
    tension?: number;
    borderWidth?: number; // for migration
    strokeWidth?: number;
    strokeColor?: string;
    simpleOrPivot?: 'simple' | 'pivot';
    showName?: boolean;
    showDescription?: boolean;
    showXAxisScale?: boolean;
    showXAxisTitle?: boolean;
    showYAxisScale?: boolean;
    showYAxisTitle?: boolean;
    stacked?: boolean;
    aggregationMethod?: TAggregationMethod;
    filters?: FilterExpression;

    axisPropertyLabel?: string;
    valuePropertyLabel?: string;
    maxResultCount?: number;
    requestTimeout?: number; // Timeout in milliseconds (default: 5000)
    
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

/**
 * Chart props, used in the Shesha tool box
 */
export interface IChartProps extends IConfigurableFormComponent, IChartsProps {
    hidden?: boolean;
        
    border?: IBorderValue;
    shadow?: IShadowValue;
    background?: IBackgroundValue;
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