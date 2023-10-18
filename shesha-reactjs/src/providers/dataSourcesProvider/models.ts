import { DataTableFullInstance } from "../dataTable/contexts";

export interface IDataSourceDescriptor {
  id: string;
  name: string;
  dataSource: DataTableFullInstance;
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
}
