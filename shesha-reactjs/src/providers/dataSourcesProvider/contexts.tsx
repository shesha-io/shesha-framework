import { createContext } from 'react';
import { DataTableFullInstance } from '../dataTable/contexts';
import { IDataTableSelectionActionsContext } from '../dataTableSelection/contexts';
import { IDataSourceDescriptor, IDataSourceDictionary } from './models';

export interface IDataSourcesProviderStateContext {
}

export interface IGetDataSourcePayload {
  id: string;
  name: string;
}

export interface IRegisterDataSourcePayload {
  id: string;
  name: string;
  dataSource: DataTableFullInstance;
  dataSelection: IDataTableSelectionActionsContext;
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