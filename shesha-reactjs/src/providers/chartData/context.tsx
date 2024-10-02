import { IFilter } from "@/designer-components/charts/model";
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

  data?: any[];
  items?: any[];
  refLists?: any;

  isLoaded?: boolean;

  chartFilters?: IFilter[];
  filteredData?: any[];
  isFilterVisible?: boolean;
}

export interface IChartDataAtionsContext {
  setControlProps?: (controlProps: any) => void;
  setData?: (data: any[]) => void;
  setRefLists2?: (refLists: any) => void;
  setFilterdData2?: (data: any[]) => void;
  setChartFilters2?: (filters: IFilter[]) => void;
  onFilter2?: () => void;

  setIsLoaded2?: (isLoaded: boolean) => void;
  setIsFilterVisible2?: (isFilterVisible: boolean) => void;
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