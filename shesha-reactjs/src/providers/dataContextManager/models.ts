import { DataTypes } from "@/interfaces";
import { IContextMetadata } from "@/interfaces/metadata";
import { DataContextType, IDataContextProviderActionsContext } from "../dataContextProvider/contexts";

export interface IDataContextDescriptor extends IDataContextProviderActionsContext {
  id: string;
  uid: string;
  name: string;
  description?: string | undefined;
  type: DataContextType;
  parentUid?: string | undefined;
  metadata?: IContextMetadata | undefined;
}

export interface IDataContextDictionary {
  [key: string]: IDataContextDescriptor;
}

export interface IRegisterDataContextPayload extends IDataContextDescriptor {
  initialData?: unknown;
}

export const SHESHA_ROOT_DATA_CONTEXT_MANAGER = 'SHESHA_ROOT_DATA_CONTEXT_MANAGER';


export enum SheshaCommonContexts {
  ApplicationContext = 'application',
  WebStorageContext = 'webStorage',
  AppContext = 'appContext',
  PageContext = 'pageContext',
  FormContext = 'formContext',
}

export const DEFAULT_CONTEXT_METADATA = {
  name: '',
  dataType: DataTypes.context,
  apiEndpoints: {},
  specifications: {},
  properties: [],
  methods: [],
} as IContextMetadata;
