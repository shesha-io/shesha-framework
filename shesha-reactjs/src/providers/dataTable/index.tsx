import React, {
  FC,
  PropsWithChildren,
} from 'react';
import { MetadataProvider } from '@/providers/metadata';
import { BackendDataSourceTable } from './repository/backendRepository';
import { FormDataSourceTable } from './repository/inMemoryRepository';
import { UrlDataSourceTable } from './repository/urlRepository';
import {
  ITableRowData,
} from './interfaces';
import { IModelMetadata } from '@/interfaces/metadata';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { IDataTableProviderBaseProps } from './provider.props';
import {
  useDataTableStateOrUndefined,
  useDataTableState,
  useDataTableActionsOrUndefined,
  useDataTableActions,
  useDataTableStoreOrUndefined,
  useDataTableStore,
  useDataFetchDependency,
} from './hooks';

export type DataTableProviderWithUrlData = IDataTableProviderBaseProps & IHasEntityDataSourceConfig;

interface IHasDataSourceType {
  sourceType: 'Form' | 'Entity' | 'Url';
}
export interface IHasFormDataSourceConfig {
  propertyName: string;
  getFieldValue: (propertyName: string) => ITableRowData[];
  metadata?: IModelMetadata;
  onChange: (...args: unknown[]) => void;
}
export interface IUrlDataSourceConfig {
  getDataPath?: string | undefined;
  getExportToExcelPath?: string;
}
export interface IHasEntityDataSourceConfig extends IUrlDataSourceConfig {
  /** Type of entity */
  entityType: string | IEntityTypeIdentifier;
}

const DataTableWithMetadataProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  const modelType = (props as IHasEntityDataSourceConfig).entityType;

  return props.sourceType === 'Entity' && modelType
    ? <MetadataProvider id={props.userConfigId} modelType={modelType}>{props.children}</MetadataProvider>
    // use metadata provider with empty model to reset metadata (clear property list for column editor)
    : <MetadataProvider id={props.userConfigId} modelType="">{props.children}</MetadataProvider>;
};

type IDataTableProviderProps = IDataTableProviderBaseProps &
  IHasDataSourceType &
  (IHasFormDataSourceConfig | IUrlDataSourceConfig | IHasEntityDataSourceConfig) & {};

type FormDataSourceTableProviderProps = IDataTableProviderBaseProps & IHasDataSourceType & IHasFormDataSourceConfig;
const isFormDataTable = (props: IDataTableProviderProps): props is FormDataSourceTableProviderProps => props.sourceType === 'Form';

type BackendDataSourceTableProviderProps = IDataTableProviderBaseProps & IHasDataSourceType & IHasEntityDataSourceConfig;
const isBackendDataTable = (props: IDataTableProviderProps): props is BackendDataSourceTableProviderProps => props.sourceType === 'Entity';

type UrlDataSourceTableProviderProps = IDataTableProviderBaseProps & IHasDataSourceType & IUrlDataSourceConfig;
const isUrlDataTable = (props: IDataTableProviderProps): props is UrlDataSourceTableProviderProps => props.sourceType === 'Url';

const DataTableProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  return (
    <DataTableWithMetadataProvider {...props}>
      {isFormDataTable(props) && <FormDataSourceTable {...props} />}
      {isBackendDataTable(props) && <BackendDataSourceTable {...props} />}
      {isUrlDataTable(props) && <UrlDataSourceTable {...props} />}
    </DataTableWithMetadataProvider>
  );
};

export default DataTableProvider;
export {
  DataTableProvider,
  useDataTableStateOrUndefined,
  useDataTableState,
  useDataTableActionsOrUndefined,
  useDataTableActions,
  useDataTableStoreOrUndefined,
  useDataTableStore,
  useDataFetchDependency,
};
