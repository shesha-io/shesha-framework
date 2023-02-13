type FilterType = 'hql' | 'queryBuilder';

export interface ITableViewProps {
  id: string;
  name: string;
  tooltip?: string;
  sortOrder: number;
  filterType: FilterType;
  visibility?: string;
  permissions?: string;
  expression?: any;
  selected?: boolean;
  useExpression?: boolean;
  defaultSelected?: boolean;
}
