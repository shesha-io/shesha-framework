import { ConfigurableFormInstance, DataTypes } from "@/interfaces";
import { IContextMetadata } from "@/interfaces/metadata";
import { DataContextType, IDataContextProviderActionsContext } from "../dataContextProvider/contexts";

export interface IDataContextDescriptor<TData extends object = object> extends IDataContextProviderActionsContext<TData> {
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

export interface IDataContextManagerState {
  lastUpdate: number;
  id: string;
  parent?: IDataContextManagerFullInstance | undefined;

}

export interface IDataContextsData {
  [key: string]: unknown;
  lastUpdate: number;
}

export interface IDataContextManagerActions {
  registerDataManager: (payload: IDataContextManagerFullInstance) => void;
  unregisterDataManager: (payload: IDataContextManagerFullInstance) => void;
  registerDataContext: (payload: IRegisterDataContextPayload) => void;
  unregisterDataContext: (payload: IRegisterDataContextPayload) => void;
  getLocalDataContexts: (contextId: string) => IDataContextDescriptor[];
  getDataContexts: (topId?: string) => IDataContextDescriptor[];
  getDataContextsData: (topId?: string, data?: IDataContextsData) => IDataContextsData;
  getDataContext: (contextId: string) => IDataContextDescriptor | undefined;
  getNearestDataContext: (topId: string, type: DataContextType) => IDataContextDescriptor | undefined;
  getDataContextData: (contextId: string) => unknown;
  onChangeContext: (dataContext: IDataContextDescriptor) => void;
  onChangeContextData: () => void;
  updatePageFormInstance: (form: ConfigurableFormInstance) => void;
  getPageFormInstance: () => ConfigurableFormInstance | undefined;
  getPageContext: () => IDataContextDescriptor | undefined;
  getRoot: () => IDataContextManagerFullInstance | undefined;
  getParent: () => IDataContextManagerFullInstance | undefined;
}

export interface IDataContextManagerFullInstance extends IDataContextManagerState, IDataContextManagerActions {

}
