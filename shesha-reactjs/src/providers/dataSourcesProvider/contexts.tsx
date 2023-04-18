import { createContext } from 'react';
import { IDataSourceDescriptor, IDataSourceDictionary, IGetDataSourcePayload, IRegisterDataSourcePayload } from './models';

export interface IDataSourcesProviderStateContext {
}

export interface IDataSourcesProviderActionsContext {
  registerDataSource: (payload: IRegisterDataSourcePayload) => void;
  getDataSources: () => IDataSourceDictionary;
  unregisterDataSource: (payload: IRegisterDataSourcePayload) => void;
  getDataSource: (payload: IGetDataSourcePayload | string) => IDataSourceDescriptor;
}

/** initial state */
export const DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE: IDataSourcesProviderStateContext = {
};

export const DataSourcesProviderStateContext = createContext<IDataSourcesProviderStateContext>(DATA_SOURCES_PROVIDER_CONTEXT_INITIAL_STATE);

export const DataSourcesProviderActionsContext = createContext<IDataSourcesProviderActionsContext>(undefined);