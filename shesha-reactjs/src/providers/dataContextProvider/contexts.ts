import { createContext, useContext } from 'react';
import { IModelMetadata } from "@/index";

export interface IDataContextFullInstance extends IDataContextProviderStateContext, IDataContextProviderActionsContext { }

export interface IDataContextProviderStateContext {
  id: string;
  name: string;
  description?: string;
  type: string;
  //data?: object;
  parentDataContext?: IDataContextFullInstance | null;
  metadata?: Promise<IModelMetadata>;
}

export interface IDataContextFull {
  data: any;
  api: any;
  metadata: Promise<IModelMetadata>;
  setFieldValue: ContextSetFieldValue;
}

export interface IDataContextProviderActionsContext {
  setFieldValue: ContextSetFieldValue;
  getFieldValue: ContextGetFieldValue;
  setData: ContextSetData;
  getData: ContextGetData;
  getFull: ContextGetFull;
  updateApi: (api: object) => any;
  getApi: () => any;
  updateOnChangeData: (func: ContextOnChangeData) => void;
}

export interface IDataContextProviderActionsContextOverride extends Partial<IDataContextProviderActionsContext> {}

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = { id: '', name: '', type: '' };

export const DataContextProviderStateContext = createContext<IDataContextProviderStateContext>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE);
export const DataContextProviderActionsContext = createContext<IDataContextProviderActionsContext>(undefined);

export type DataContextType = 'root' | 'form' | 'control' | 'settings';


export type ContextGetFieldValue = (name: string) => any;
export type ContextGetFull = () => IDataContextFull;
export type ContextGetData = () => any;
export type ContextSetFieldValue = <T,>(name: string, value: T, refreshContext?: RefreshContext) => void;
export type ContextSetData = <T,>(changedData: T, refreshContext?: RefreshContext) => void;
export type ContextOnChangeData = <T,>(data: T, changedData: any, refreshContext?: RefreshContext) => void;
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
