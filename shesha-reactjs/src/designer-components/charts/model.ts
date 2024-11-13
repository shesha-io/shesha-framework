import { IConfigurableFormComponent } from "@/providers";

/**
 * Chart data that will go into the actual chart component from ChartJS
 */
export interface IChartData {
    labels: (string | number | object)[];
    datasets: object[];
}

export interface IChartProps extends IConfigurableFormComponent {
    chartType?: TChartType;
    showTitle?: boolean;
    title?: string;
    showLegend?: boolean;
    showXAxisScale?: boolean;
    showXAxisLabelTitle?: boolean;
    showYAxisScale?: boolean;
    showYAxisLabelTitle?: boolean;
    legendPosition?: TLegendPosition;
    entityType?: string;
    filters?: string[];
    valueProperty?: string;
    axisProperty?: string;
    legendProperty?: string;
    xProperty?: string;
    yProperty?: string;
    tension?: number;
    strokeColor?: string;
    aggregationMethod?: TAggregationMethod;
}

export interface IChartsProps {
    chartType?: TChartType;
    showTitle?: boolean;
    title?: string;
    name?: string;
    description?: string;
    showLegend?: boolean;
    legendPosition?: TLegendPosition;
    entityType?: string;
    filters?: string[];
    valueProperty?: string;
    axisProperty?: string;
    legendProperty?: string;
    allowFilter?: boolean;
    filterProperties?: string[];
    xProperty?: string;
    yProperty?: string;
    tension?: number;
    strokeColor?: string;
    simpleOrPivot?: 'simple' | 'pivot';
    showName?: boolean;
    showDescription?: boolean;
    showXAxisScale?: boolean;
    showXAxisLabelTitle?: boolean;
    showYAxisScale?: boolean;
    showYAxisLabelTitle?: boolean;
    stacked?: boolean;
    aggregationMethod?: TAggregationMethod;
}

export interface IChartDataProps extends IChartsProps {
    labels?: string[];
    chartData?: number[];
    data?: IChartData;
}

export type TChartType = 'polarArea' | 'bar' | 'line' | 'pie';

export type TAggregationMethod = 'count' | 'sum' | 'average' | 'min' | 'max';

export type TLegendPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

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

export interface IFilter {
    property: string;
    operator: TOperator;
    value: string | number;
}