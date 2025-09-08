import { useContext } from 'react';
import { IModelMetadata } from "@/index";
import { createNamedContext } from '@/utils/react';

export interface IDataContextFullInstance extends IDataContextProviderStateContext, IDataContextProviderActionsContext { }

export interface IDataContextProviderStateContext {
  id: string;
  uid: string;
  name: string;
  description?: string;
  type: string;
  // data?: object;
  parentDataContext?: IDataContextFullInstance | null;
  metadata?: Promise<IModelMetadata>;
}

export interface IDataContextFull {
  [key: string]: any;
  api?: any;
  metadata?: Promise<IModelMetadata>;
  setFieldValue?: ContextSetFieldValue;
}

export interface IDataContextProviderActionsContext {
  setFieldValue: ContextSetFieldValue;
  getFieldValue: ContextGetFieldValue;
  setData: ContextSetData;
  getData: ContextGetData;
  getFull: ContextGetFull;
  updateApi: (api: object) => any;
  getApi: () => any;
}

export interface IDataContextProviderActionsContextOverride extends Partial<IDataContextProviderActionsContext> {}

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = { id: '', uid: '', name: '', type: '' };

export const DataContextProviderStateContext = createNamedContext<IDataContextProviderStateContext>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE, "DataContextProviderStateContext");
export const DataContextProviderActionsContext = createNamedContext<IDataContextProviderActionsContext>(undefined, "DataContextProviderActionsContext");

export type DataContextType = 'root' | 'storage' | 'app' | 'page' | 'form' | 'control' | 'settings' | 'appLayer';


export type ContextGetFieldValue = (name: string) => any;
export type ContextGetFull = () => IDataContextFull;
export type ContextGetData = () => any;
export type ContextSetFieldValue = <T>(name: string, value: T, refreshContext?: RefreshContext) => void;
export type ContextSetData = (changedData: any, refreshContext?: RefreshContext) => void;
export type ContextOnChangeData = <T>(data: T, changedData: any, refreshContext?: RefreshContext) => void;
export type RefreshContext = () => void;

export function useDataContext(require: boolean = true) {
  const actionsContext = useContext(DataContextProviderActionsContext);
  const stateContext = useContext(DataContextProviderStateContext);

  if ((actionsContext === undefined || stateContext === undefined) && require) {
    throw new Error('useDataContext must be used within a DataContextProvider');
  }
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext } as IDataContextFullInstance
    : undefined;
}
