import { DataTableFullInstance } from "../dataTable/contexts";
import { DataTableSelectionFullInstance, IDataTableSelectionActionsContext } from "../dataTableSelection/contexts";

export interface IDataSourceDescriptor {
  id: string;
  name: string;
  dataSource: DataTableFullInstance;
  dataSelection: DataTableSelectionFullInstance;
}

export interface IDataSourceDictionary {
  [key: string]: IDataSourceDescriptor;
}

export interface IGetDataSourcePayload {
  id: string;
  name: string;
}

export interface IRegisterDataSourcePayload {
  id: string;
  name: string;
  dataSource: DataTableFullInstance;
  dataSelection: IDataTableSelectionActionsContext;
}