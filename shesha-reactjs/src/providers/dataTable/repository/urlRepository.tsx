import { HttpClientApi, IUrlDataSourceConfig, useHttpClient, useMetadataDispatcher } from '@/providers';
import React, { useMemo, FC, PropsWithChildren } from 'react';

import { camelcaseDotNotation } from '@/utils/string';
import {
  DataTableColumnDto,
  IGetDataFromUrlPayload,
  IGetListDataPayload,
  ITableDataFetchColumn,
  ITableDataInternalResponse,
  ITableDataResponse,
} from '../interfaces';
import { IRepository, RowsReorderPayload } from './interfaces';
import { convertDotNotationPropertiesToGraphQL } from '@/providers/form/utils';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IMetadataDispatcher } from '@/providers/metadataDispatcher/contexts';
import { IEntityEndpointsEvaluator, useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import { IUseMutateResponse, useMutate } from '@/hooks/useMutate';
import { buildUrl } from '@/utils';
import { extractAjaxResponse, IAjaxResponse } from '@/interfaces/ajaxResponse';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { DataTableProviderWithRepository, IDataTableProviderWithRepositoryProps } from '../provider-with-repo';
import { isNonEmptyArray } from '@/utils/array';

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
    const dataResponse = extractAjaxResponse(response.data);

    const { pageSize } = payload;
    const { items, totalCount } = dataResponse;

    const result: ITableDataInternalResponse = {
      totalRows: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      rows: items,
      totalRowsBeforeFilter: 0,
    };
    return result;
  };

  const prepareColumns = (_: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    return Promise.resolve([]);
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
