import React, { FC, PropsWithChildren, useCallback, useContext, useEffect, useRef } from 'react';
import {
  DataSourcesProviderActionsContext,
  IDataSourcesProviderActionsContext,
} from './contexts';
import { IDataSourceDescriptor, IDataSourceDictionary, IGetDataSourcePayload, IRegisterDataSourcePayload } from './models';
import { throwError } from '@/utils/errors';

const DataSourcesProvider: FC<PropsWithChildren> = ({ children }) => {
  const dataSources = useRef<IDataSourceDictionary>({});

  const registerDataSource = useCallback((payload: IRegisterDataSourcePayload): void => {
    dataSources.current = {
      ...dataSources.current,
      [`${payload.id}_${payload.name}`]: {
        id: payload.id,
        name: payload.name,
        dataSource: payload.dataSource,
      },
    };
  }, []);

  const unregisterDataSource = useCallback((payload: IRegisterDataSourcePayload): void => {
    delete dataSources.current[`${payload.id}_${payload.name}`];
  }, []);

  const getDataSources = useCallback((): IDataSourceDictionary => {
    return dataSources.current;
  }, []);

  const getDataSource = useCallback((payload: IGetDataSourcePayload | string): IDataSourceDescriptor | undefined => {
    return (typeof (payload) === 'string')
      ? dataSources.current[payload]
      : dataSources.current[`${payload.id}_${payload.name}`];
  }, []);

  const dataSourcesProviderActions: IDataSourcesProviderActionsContext = {
    registerDataSource,
    unregisterDataSource,
    getDataSources,
    getDataSource,
  };

  return (
    <DataSourcesProviderActionsContext.Provider value={dataSourcesProviderActions}>
      {children}
    </DataSourcesProviderActionsContext.Provider>
  );
};

const useDataSources = (): IDataSourcesProviderActionsContext => useContext(DataSourcesProviderActionsContext) ?? throwError('useDataSources must be used within a DataSourcesProvider');

function useDataSource(
  payload: IRegisterDataSourcePayload,
): void {
  const { registerDataSource, unregisterDataSource } = useDataSources();

  useEffect(() => {
    registerDataSource(payload);
    return () => {
      unregisterDataSource(payload);
    };
  }, [payload, registerDataSource, unregisterDataSource]);
}

export { DataSourcesProvider, useDataSources, useDataSource };
