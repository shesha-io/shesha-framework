import { DataTypes } from "@/index";
import { IModelMetadata } from "@/interfaces/metadata";
import { IDataContextProviderActionsContext } from "@/providers/dataContextProvider";

export interface IDataContextDescriptor extends IDataContextProviderActionsContext {
  id: string;
  name: string;
  description?: string;
  type: string;
  parentId?: string;
  metadata?: IModelMetadata;
  api?: object;
}

export interface IDataContextDictionary {
  [key: string]: IDataContextDescriptor;
}

export interface IRegisterDataContextPayload extends IDataContextDescriptor {
  initialData?: any;
}

export enum SheshaCommonContexts {
  ApplicationContext = 'appContext'
}

export const DEFAULT_CONTEXT_METADATA = {
  name: '',
  dataType: DataTypes.context,
  apiEndpoints: {},
  specifications: {},
  properties: []
} as IModelMetadata;
