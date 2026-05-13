import { HttpClientApi, IUrlDataSourceConfig, useHttpClient, useMetadataDispatcher } from '@/providers';
import React, { FC, PropsWithChildren, useMemo } from 'react';

import { IEntityEndpointsEvaluator, useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import { IUseMutateResponse, useMutate } from '@/hooks/useMutate';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces/ajaxResponse';
import { IConfigurableColumnsProps, IDataColumnsProps, isDataColumnProps } from '@/providers/datatableColumnsConfigurator/models';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { convertDotNotationPropertiesToGraphQL } from '@/providers/form/utils';
import { IMetadataDispatcher } from '@/providers/metadataDispatcher/contexts';
import { buildUrl } from '@/utils';
import { isNonEmptyArray } from '@/utils/array';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { camelcaseDotNotation } from '@/utils/string';
import {
  DataTableColumnDto,
  IGetDataFromUrlPayload,
  IGetListDataPayload,
  ITableDataFetchColumn,
  ITableDataInternalResponse,
  ITableDataResponse,
  ITableRowData,
} from '../interfaces';
import { DataTableProviderWithRepository, IDataTableProviderWithRepositoryProps } from '../provider';
import { IRepository, RowsReorderPayload } from './interfaces';

export interface IWithUrlRepositoryArgs {
  getListUrl: string;
}

export const UrlRepositoryType = 'url-repository';

export type IUrlRepository = IRepository;

interface ICreateUrlRepositoryArgs extends IWithUrlRepositoryArgs {
  httpClient: HttpClientApi;
  metadataDispatcher: IMetadataDispatcher;
  apiHelper: IEntityEndpointsEvaluator;
  mutator: IUseMutateResponse<unknown>;
}

// URL sources have no server-side metadata feed. Configured column props may carry optional
// runtime fields (dataType, referenceListName, etc.) that aren't in IDataColumnsProps; we
// read them through this extended view to forward whatever the designer captured.
type IUrlExtendedDataColumn = IDataColumnsProps & {
  dataType?: string;
  dataFormat?: string;
  referenceListName?: string;
  referenceListModule?: string;
  entityTypeName?: string;
  entityTypeModule?: string;
  allowInherited?: boolean;
  metadata?: IPropertyMetadata;
};

const isPagedResponse = (value: unknown): value is { items: ITableRowData[]; totalCount: number } => {
  if (value === null || typeof value !== 'object')
    return false;
  const v = value as { items?: unknown; totalCount?: unknown };
  return Array.isArray(v.items) && typeof v.totalCount === 'number';
};

const createRepository = (args: ICreateUrlRepositoryArgs): IUrlRepository => {
  const { httpClient, getListUrl } = args;

  const getPropertyNamesForFetching = (columns: ITableDataFetchColumn[]): string[] => {
    const result: string[] = [];
    columns.forEach((column) => {
      if (!column.propertiesToFetch)
        return;
      if (Array.isArray(column.propertiesToFetch)) {
        column.propertiesToFetch.forEach((p) => {
          if (!!p)
            result.push(p);
        });
      } else {
        result.push(column.propertiesToFetch);
        // special handling for entity references: expand properties list to include `id` and `_displayName`
        if (column.isEnitty) {
          const requiredProps = [`${column.propertiesToFetch}.Id`, `${column.propertiesToFetch}._displayName`];
          requiredProps.forEach((rp) => {
            if (!result.includes(rp))
              result.push(rp);
          });
        };
      };
    });
    return result;
  };

  /** Convert common payload to a form that uses the back-end */
  const convertPayload = (payload: IGetListDataPayload): IGetDataFromUrlPayload => {
    const properties = getPropertyNamesForFetching(payload.columns);

    const result: IGetDataFromUrlPayload = {
      maxResultCount: payload.pageSize,
      skipCount: (payload.currentPage - 1) * payload.pageSize,
      properties: convertDotNotationPropertiesToGraphQL(properties),
      quickSearch: payload.quickSearch,
      sorting: isNonEmptyArray(payload.sorting)
        ? payload.sorting
          .filter((s) => Boolean(s.id))
          .map((s) => camelcaseDotNotation(s.id) + (s.desc ? ' desc' : ''))
          .join(',')
        : undefined,
      filter: payload.filter,
    };

    return result;
  };

  const fetch = async (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
    // Check if getListUrl is empty then return empty result
    if (isNullOrWhiteSpace(getListUrl))
      return Promise.resolve({ totalRows: 0, totalPages: 1, rows: [], totalRowsBeforeFilter: 0 });

    const getDataPayload = convertPayload(payload);

    const getDataUrl = buildUrl(getListUrl, getDataPayload);

    const response = await httpClient.get<IAjaxResponse<ITableDataResponse>>(getDataUrl);
    const dataResponse: unknown = extractAjaxResponse(response.data);

    const { pageSize } = payload;
    const { items, totalCount }: { items: ITableRowData[]; totalCount: number } = Array.isArray(dataResponse)
      ? { items: dataResponse as ITableRowData[], totalCount: dataResponse.length }
      : isPagedResponse(dataResponse)
        ? { items: dataResponse.items, totalCount: dataResponse.totalCount }
        : { items: [], totalCount: 0 };

    const result: ITableDataInternalResponse = {
      totalRows: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      rows: items,
      totalRowsBeforeFilter: 0,
    };
    return result;
  };

  const prepareColumns = (configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    if (!isNonEmptyArray(configurableColumns))
      return Promise.resolve([]);

    const dataTableColumns = configurableColumns
      .filter((c): c is IUrlExtendedDataColumn => isDataColumnProps(c))
      .map<DataTableColumnDto>((col) => {
        const name = col.propertyName || col.accessor || col.caption;
        return {
          propertyName: name,
          name,
          caption: col.caption,
          description: col.description ?? null,
          dataType: col.dataType ?? 'string',
          dataFormat: col.dataFormat ?? null,
          referenceListName: col.referenceListName ?? null,
          referenceListModule: col.referenceListModule ?? null,
          entityTypeName: col.entityTypeName ?? null,
          entityTypeModule: col.entityTypeModule ?? null,
          allowInherited: col.allowInherited ?? false,
          isFilterable: true,
          isSortable: col.allowSorting !== false,
          metadata: col.metadata ?? null,
        };
      });

    return Promise.resolve(dataTableColumns);
  };

  const performUpdate = <TData extends object = object>(_rowIndex: number, _: TData): Promise<TData> => {
    throw new Error(`Updating is not supported by the repository '${UrlRepositoryType}'`);
  };

  const performDelete = <TData extends object = object>(_rowIndex: number, _: TData): Promise<TData> => {
    throw new Error(`Deleting is not supported by the repository '${UrlRepositoryType}'`);
  };

  const performCreate = <TData extends object = object>(_rowIndex: number, _: TData): Promise<TData> => {
    throw new Error(`Creating is not supported by the repository '${UrlRepositoryType}'`);
  };

  const exportToExcel = (_: IGetListDataPayload): Promise<void> => {
    return Promise.resolve();
  };

  const reorder = (_payload: RowsReorderPayload): Promise<void> => {
    return Promise.reject(`Reordering is not supported by the repository '${UrlRepositoryType}'`);
  };

  const repository: IUrlRepository = {
    repositoryType: UrlRepositoryType,
    fetch,
    reorder,
    exportToExcel,
    prepareColumns,
    performCreate,
    performUpdate,
    performDelete,
  };
  return repository;
};

export const useUrlRepository = (args: IWithUrlRepositoryArgs): IUrlRepository => {
  const httpClient = useHttpClient();
  const metadataDispatcher = useMetadataDispatcher();
  const apiHelper = useModelApiHelper();
  const mutator = useMutate();

  const repository = useMemo<IUrlRepository>(() => {
    return createRepository({
      ...args,
      httpClient,
      metadataDispatcher,
      apiHelper,
      mutator,
    });
  }, [apiHelper, args, httpClient, metadataDispatcher, mutator]);

  return repository;
};

export const UrlDataSourceTable: FC<IUrlDataSourceConfig & PropsWithChildren<Omit<IDataTableProviderWithRepositoryProps, 'repository'>>> = (props) => {
  const { getDataPath = "", ...restProps } = props;
  const repository = useUrlRepository({ getListUrl: getDataPath });

  return (
    <DataTableProviderWithRepository {...restProps} repository={repository} />
  );
};
