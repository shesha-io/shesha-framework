import { IDataContextFullInstance } from "providers/dataContextProvider";

export interface IDataContextDescriptor {
  id: string;
  parentId?: string;
  name: string;
  type: string;
  dataContext?: IDataContextFullInstance;
}

export interface IDataContextDictionary {
  [key: string]: IDataContextDescriptor;
}

export interface IGetDataContextPayload {
  id: string;
  name: string;
}