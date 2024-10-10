import { IChartsProps, IFilter } from "@/designer-components/charts/model";
import { IRefListPropertyMetadata } from "@/interfaces/metadata";
import { createContext } from "react";

export interface IChartDataContext {
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
  legendProperty?: string;
  xProperty?: string;
  yProperty?: string;
  simpleOrPivot?: 'simple' | 'pivot';
  showXAxisLabel?: boolean;
  showXAxisLabelTitle?: boolean;
  showYAxisLabel?: boolean;
  showYAxisLabelTitle?: boolean;
  stacked?: boolean;
  aggregationMethod?: 'count' | 'sum' | 'average' | 'min' | 'max';
  tension?: number;
  strokeColor?: string;

  data?: object[];
  items?: object[];
  refLists?: {
    [key: string]: IRefListPropertyMetadata[];
  };

  isLoaded?: boolean;

  chartFilters?: IFilter[];
  filteredData?: object[];
  isFilterVisible?: boolean;
}

export interface IChartDataAtionsContext {
  setControlProps?: (controlProps: IChartsProps) => void;
  setData?: (data: object[]) => void;
  setRefLists?: (refLists: object) => void;
  setFilterdData?: (data: object[]) => void;
  setChartFilters?: (filters: IFilter[]) => void;
  onFilter?: () => void;

  setIsLoaded?: (isLoaded: boolean) => void;
  setIsFilterVisible?: (isFilterVisible: boolean) => void;
}

export const INITIAL_STATE: IChartDataContext = {
  chartType: 'pivot',
  showTitle: true,
  title: 'Chart Title',
  showLegend: true,
  legendPosition: 'top',
  entityType: 'entity',
  filters: {

  },
  valueProperty: 'value',
  axisProperty: 'axis',
  legendProperty: 'legend',
  xProperty: 'x',
  yProperty: 'y',
  simpleOrPivot: 'simple',
  showXAxisLabel: true,
  showXAxisLabelTitle: true,
  showYAxisLabel: true,
  showYAxisLabelTitle: true,
  aggregationMethod: 'count',
  tension: 0,

  data: [],
  items: [],
  refLists: {},

  isLoaded: false,

  chartFilters: [],
  filteredData: [],
  isFilterVisible: false,
};

export const ChartDataStateContext = createContext<IChartDataContext>(INITIAL_STATE);
export const ChartDataActionsContext = createContext<IChartDataAtionsContext>(undefined);