import React, { FC, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import {
  DataSourcesProviderActionsContext,
  DataSourcesProviderStateContext,
  IDataSourcesProviderActionsContext,
  IDataSourcesProviderStateContext,
} from './contexts';
import { IDataSourceDescriptor, IDataSourceDictionary, IGetDataSourcePayload, IRegisterDataSourcePayload } from './models';

const DataSourcesProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state] = useState<IDataSourcesProviderStateContext>({});

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
    <DataSourcesProviderStateContext.Provider value={state}>
      <DataSourcesProviderActionsContext.Provider value={dataSourcesProviderActions}>
        {children}
      </DataSourcesProviderActionsContext.Provider>
    </DataSourcesProviderStateContext.Provider>
  );
};

function useDataSources(require: boolean = true): IDataSourcesProviderActionsContext & IDataSourcesProviderStateContext | undefined {
  const actionsContext = useContext(DataSourcesProviderActionsContext);
  const stateContext = useContext(DataSourcesProviderStateContext);

  if ((actionsContext === undefined || stateContext === undefined) && require) {
    throw new Error('useDataSources must be used within a DataSourcesProvider');
  }
  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
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
