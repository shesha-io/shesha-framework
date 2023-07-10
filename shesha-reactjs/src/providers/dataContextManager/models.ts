export interface IDataContextDescriptor {
  id: string;
  parentId?: string;
  name: string;
  type: string;
  data?: object;
  //dataContext: DataContextFullInstance;
  //parentDataContext?: DataContextFullInstance | undefined;
}

export interface IDataContextDictionary {
  [key: string]: IDataContextDescriptor;
}

export interface IGetDataContextPayload {
  id: string;
  name: string;
}