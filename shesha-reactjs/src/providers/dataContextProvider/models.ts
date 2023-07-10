import { DataContextFullInstance } from "providers/dataContextProvider";

export interface IRegisterDataContextPayload {
  id: string;
  name: string;
  type: string;
  data?: any;
  parentId?: string;
  dataContext?: DataContextFullInstance;
  parentDataContext?: DataContextFullInstance | undefined;
}