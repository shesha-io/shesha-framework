import { DataTypes } from "@/index";
import { IModelMetadata } from "@/interfaces/metadata";
import { DataContextType, IDataContextProviderActionsContext } from "../dataContextProvider/contexts";

export interface IDataContextDescriptor extends IDataContextProviderActionsContext {
  id: string;
  name: string;
  description?: string;
  type: DataContextType;
  parentId?: string;
  metadata?: IModelMetadata;
}

export interface IDataContextDictionary {
  [key: string]: IDataContextDescriptor;
}

export interface IRegisterDataContextPayload extends IDataContextDescriptor {
  initialData?: any;
}

export enum SheshaCommonContexts {
  ApplicationContext = 'application',
  AppContext = 'appContext'
}

export const DEFAULT_CONTEXT_METADATA = {
  name: '',
  dataType: DataTypes.context,
  apiEndpoints: {},
  specifications: {},
  properties: []
} as IModelMetadata;
