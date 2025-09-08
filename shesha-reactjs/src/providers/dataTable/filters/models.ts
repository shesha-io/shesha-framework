export interface ITableViewProps {
  id: string;
  name: string;
  tooltip?: string;
  sortOrder: number;
  visibility?: string;
  permissions?: string[];
  expression?: any;
  selected?: boolean;
  defaultSelected?: boolean;
}
