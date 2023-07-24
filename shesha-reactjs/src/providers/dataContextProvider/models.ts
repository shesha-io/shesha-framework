import { IDataContextFullInstance } from "providers/dataContextProvider";

export interface IRegisterDataContextPayload {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  dataContext?: IDataContextFullInstance;
}