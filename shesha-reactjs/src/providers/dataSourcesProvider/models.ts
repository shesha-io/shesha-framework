import { DataTableFullInstance } from "../dataTable/contexts";
import { DataTableSelectionFullInstance } from "../dataTableSelection/contexts";

export interface IDataSourceDescriptor {
  id: string;
  name: string;
  dataSource: DataTableFullInstance;
  dataSelection: DataTableSelectionFullInstance;
}

export interface IDataSourceDictionary {
  [key: string]: IDataSourceDescriptor;
}