import {
  IDataSourceDescriptor,
  IDataSourceDictionary,
  IGetDataSourcePayload,
  IRegisterDataSourcePayload,
} from './models';
import { createNamedContext } from '@/utils/react';

export interface IDataSourcesProviderStateContext {}

export interface IDataSourcesProviderActionsContext {
  registerDataSource: (payload: IRegisterDataSourcePayload) => void;
  getDataSources: () => IDataSourceDictionary;
  unregisterDataSource: (payload: IRegisterDataSourcePayload) => void;
  getDataSource: (payload: IGetDataSourcePayload | string) => IDataSourceDescriptor;
}

/** initial state */
export const DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE: IDataSourcesProviderStateContext = {};

export const DataSourcesProviderStateContext = createNamedContext<IDataSourcesProviderStateContext>(
  DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE,
  "DataSourcesProviderStateContext",
);

export const DataSourcesProviderActionsContext = createNamedContext<IDataSourcesProviderActionsContext>(undefined, "DataSourcesProviderActionsContext");
