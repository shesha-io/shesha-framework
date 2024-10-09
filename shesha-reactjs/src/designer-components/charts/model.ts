import { IRefListPropertyMetadata } from "@/interfaces/metadata";
import { IConfigurableFormComponent } from "@/providers";

/**
 * Chart data that will go into the actual chart component from ChartJS
 */
export interface IChartData {
    labels: (string | number | object)[];
    datasets: object[];
}

export interface IChartProps extends IConfigurableFormComponent {
    chartType?: 'polarArea' | 'bar' | 'line' | 'pie';
    showTitle?: boolean;
    title?: string;
    showLegend?: boolean;
    showXAxisLabel?: boolean;
    showXAxisLabelTitle?: boolean;
    showYAxisLabel?: boolean;
    showYAxisLabelTitle?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    entityType?: string;
    filters?: string[];
    valueProperty?: string;
    axisProperty?: string;
    legendProperty?: string;
    xProperty?: string;
    yProperty?: string;
    tension?: number;
    strokeColor?: string;
    aggregationMethod?: 'count' | 'sum' | 'average' | 'min' | 'max';
}

export interface IChartsProps {
    chartType?: 'polarArea' | 'bar' | 'line' | 'pie';
    showTitle?: boolean;
    title?: string;
    name?: string;
    description?: string;
    showLegend?: boolean;
    legendPosition?: 'top' | 'bottom' | 'left' | 'right' | 'center';
    entityType?: string;
    filters?: string[];
    valueProperty?: string;
    axisProperty?: string;
    legendProperty?: string;
    filterProperties?: string[];
    xProperty?: string;
    yProperty?: string;
    tension?: number;
    strokeColor?: string;
    simpleOrPivot?: 'simple' | 'pivot';
    showName?: boolean;
    showDescription?: boolean;
    showXAxisLabel?: boolean;
    showXAxisLabelTitle?: boolean;
    showYAxisLabel?: boolean;
    showYAxisLabelTitle?: boolean;
    stacked?: boolean;
    aggregationMethod?: 'count' | 'sum' | 'average' | 'min' | 'max';
}

export interface IChartDataProps extends IChartsProps {
    labels?: string[];
    chartData?: number[];
    data?: IChartData;
    refLists?: {
        [key: string]: IRefListPropertyMetadata[];
    };
}

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