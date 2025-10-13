import { useContext } from 'react';
import { IModelMetadata } from "@/index";
import { createNamedContext } from '@/utils/react';
import { DEFAULT_CONTEXT_METADATA } from '../dataContextManager/models';
import { Path, PathValue } from '@/utils/dotnotation';

export interface IDataContextFullInstance extends IDataContextProviderStateContext, IDataContextProviderActionsContext { }

export interface IDataContextProviderStateContext {
  id: string;
  uid: string;
  name: string;
  description?: string | undefined;
  type: string;
  parentDataContext?: IDataContextFullInstance | undefined;
  metadata: Promise<IModelMetadata>;
}

export interface IDataContextFull {
  [key: string]: unknown;
  api?: unknown;
  metadata?: Promise<IModelMetadata> | undefined;
  setFieldValue?: ContextSetFieldValue | undefined;
}

export interface IDataContextProviderActionsContext<TData extends object = object> {
  setFieldValue: ContextSetFieldValue<TData>;
  getFieldValue: ContextGetFieldValue;
  setData: ContextSetData<TData>;
  getData: ContextGetData;
  getFull: ContextGetFull;
  updateApi: (api: object) => unknown;
  getApi: () => unknown;
}

export type IDataContextProviderActionsContextOverride = Partial<IDataContextProviderActionsContext>;

/** initial state */
export const DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE: IDataContextProviderStateContext = {
  id: '',
  uid: '',
  name: '',
  type: '',
  metadata: Promise.resolve({ ...DEFAULT_CONTEXT_METADATA, name: '', properties: [] } as IModelMetadata),
};

export const DataContextProviderStateContext = createNamedContext<IDataContextProviderStateContext | undefined>(DATA_CONTEXT_PROVIDER_CONTEXT_INITIAL_STATE, "DataContextProviderStateContext");
export const DataContextProviderActionsContext = createNamedContext<IDataContextProviderActionsContext | undefined>(undefined, "DataContextProviderActionsContext");

export type DataContextType = 'root' | 'storage' | 'app' | 'page' | 'form' | 'control' | 'settings' | 'appLayer';


export type ContextGetFieldValue = (name: string) => unknown;
export type ContextGetFull = () => IDataContextFull;
export type ContextGetData<TData extends object = object> = () => TData;
export type ContextSetFieldValue<TData extends object = object> = <P extends Path<TData>>(name: P, value: PathValue<TData, P>, refreshContext?: RefreshContext) => void;
export type ContextSetData<TData extends object = object> = (changedData: TData, refreshContext?: RefreshContext) => void;
export type ContextOnChangeData = <T>(data: T, changedData: unknown, refreshContext?: RefreshContext) => void;
export type RefreshContext<TData extends object = object> = (data?: Partial<TData>) => void;

export const useDataContextOrUndefined = (): IDataContextProviderStateContext & IDataContextProviderActionsContext | undefined => {
  const actionsContext = useContext(DataContextProviderActionsContext);
  const stateContext = useContext(DataContextProviderStateContext);

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext } as IDataContextFullInstance
    : undefined;
};

export function useDataContext(): IDataContextProviderStateContext & IDataContextProviderActionsContext {
  const context = useDataContextOrUndefined();

  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataContextProvider');
  }
  return context;
}
