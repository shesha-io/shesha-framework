import {
  IDataSourceDescriptor,
  IDataSourceDictionary,
  IGetDataSourcePayload,
  IRegisterDataSourcePayload,
} from './models';
import { createNamedContext } from '@/utils/react';

export interface IDataSourcesProviderActionsContext {
  registerDataSource: (payload: IRegisterDataSourcePayload) => void;
  getDataSources: () => IDataSourceDictionary;
  unregisterDataSource: (payload: IRegisterDataSourcePayload) => void;
  getDataSource: (payload: IGetDataSourcePayload | string) => IDataSourceDescriptor;
}

export const DataSourcesProviderActionsContext = createNamedContext<IDataSourcesProviderActionsContext>(undefined, "DataSourcesProviderActionsContext");
