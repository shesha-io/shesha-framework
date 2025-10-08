import React, { FC, PropsWithChildren, useContext, useEffect, useRef } from 'react';
import {
  DataSourcesProviderActionsContext,
  IDataSourcesProviderActionsContext,
} from './contexts';
import { IDataSourceDescriptor, IDataSourceDictionary, IGetDataSourcePayload, IRegisterDataSourcePayload } from './models';

const DataSourcesProvider: FC<PropsWithChildren> = ({ children }) => {
  const dataSources = useRef<IDataSourceDictionary>({});

  const registerDataSource = (payload: IRegisterDataSourcePayload): void => {
    dataSources.current = {
      ...dataSources.current,
      [`${payload.id}_${payload.name}`]: {
        id: payload.id,
        name: payload.name,
        dataSource: payload.dataSource,
      },
    };
  };

  const unregisterDataSource = (payload: IRegisterDataSourcePayload): void => {
    delete dataSources.current[`${payload.id}_${payload.name}`];
  };

  const getDataSources = (): IDataSourceDictionary => {
    return dataSources.current;
  };

  const getDataSource = (payload: IGetDataSourcePayload | string): IDataSourceDescriptor | undefined => {
    return (typeof (payload) === 'string')
      ? dataSources.current[payload]
      : dataSources.current[`${payload.id}_${payload.name}`];
  };

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

function useDataSources(require: boolean = true): IDataSourcesProviderActionsContext | undefined {
  const actionsContext = useContext(DataSourcesProviderActionsContext);

  if (actionsContext === undefined && require) {
    throw new Error('useDataSources must be used within a DataSourcesProvider');
  }
  return actionsContext;
}

function useDataSource(
  payload: IRegisterDataSourcePayload,
  deps?: ReadonlyArray<any>,
): void {
  const { registerDataSource, unregisterDataSource } = useDataSources();

  useEffect(() => {
    registerDataSource(payload);
    return () => {
      unregisterDataSource(payload);
    };
  }, deps);
}

export { DataSourcesProvider, useDataSources, useDataSource };
