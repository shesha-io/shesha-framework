import axios from 'axios';
import { IHasEntityDataSourceConfig, useMetadataDispatcher, useSheshaApplication } from '@/providers';
import { IResult } from '@/interfaces/result';
import { IHttpHeadersDictionary } from '@/providers/sheshaApplication/contexts';
import qs from 'qs';
import React, { ComponentType, useMemo, FC } from 'react';

import { camelcaseDotNotation } from '@/utils/string';
import {
  DataTableColumnDto,
  IGetDataFromUrlPayload,
  IGetListDataPayload,
  ITableDataFetchColumn,
  ITableDataInternalResponse,
  ITableDataResponse,
} from '../interfaces';
import { IRepository, IHasRepository, RowsReorderPayload } from './interfaces';
import { convertDotNotationPropertiesToGraphQL } from '@/providers/form/utils';
import { IConfigurableColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IMetadataDispatcher } from '@/providers/metadataDispatcher/contexts';
import { IEntityEndpointsEvaluator, useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import { IUseMutateResponse, useMutate } from '@/hooks/useMutate';
import { getUrlKeyParam } from '@/utils';
import { wrapDisplayName } from '@/utils/react';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

export interface IWithUrlRepositoryArgs {
  getListUrl: string;
}

export const UrlRepositoryType = 'url-repository';

export type IUrlRepository = IRepository;

interface ICreateUrlRepositoryArgs extends IWithUrlRepositoryArgs {
  backendUrl: string;
  httpHeaders: IHttpHeadersDictionary;
  metadataDispatcher: IMetadataDispatcher;
  apiHelper: IEntityEndpointsEvaluator;
  mutator: IUseMutateResponse<any>;
}

const createRepository = (args: ICreateUrlRepositoryArgs): IUrlRepository => {
  const { backendUrl, httpHeaders, getListUrl } = args;

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
      sorting: payload.sorting
        .filter((s) => Boolean(s.id))
        .map((s) => camelcaseDotNotation(s.id) + (s.desc ? ' desc' : ''))
        .join(','),
      filter: payload.filter,
    };

    return result;
  };

  /** Convert back-end response to a form that is used by the data source */
  const convertListDataResponse = (
    response: IResult<ITableDataResponse>,
    pageSize: number,
  ): ITableDataInternalResponse => {
    if (!isAjaxSuccessResponse(response))
      throw 'Failed to parse response';

    const items = response.result.items ?? (Array.isArray(response.result) ? response.result : null);
    const totalCount = response.result.totalCount ?? items?.length;

    const internalResult: ITableDataInternalResponse = {
      totalRows: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      rows: items,
      totalRowsBeforeFilter: 0,
    };

    return internalResult;
  };

  const fetch = (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
    // Check if getListUrl is empty then return empty result
    if (getListUrl === null || getListUrl === undefined)
      return Promise.resolve({ totalRows: 0, totalPages: 1, rows: [], totalRowsBeforeFilter: 0 });

    const getDataPayload = convertPayload(payload);
    const key = getUrlKeyParam(getListUrl);

    const getDataUrl = `${backendUrl}${getListUrl}${key}${qs.stringify(getDataPayload)}`;

    return axios({
      url: getDataUrl,
      method: 'GET',
      headers: httpHeaders,
    }).then((response) => {
      const dataResponse = response.data as IResult<ITableDataResponse>;
      return convertListDataResponse(dataResponse, payload.pageSize);
    });
  };

  const prepareColumns = (_: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    return Promise.resolve([]);
  };

  const performUpdate = (_rowIndex: number, _: any): Promise<any> => {
    return Promise.resolve();
  };

  const performDelete = (_rowIndex: number, _: any): Promise<any> => {
    return Promise.resolve();
  };

  const performCreate = (_rowIndex: number, _: any): Promise<any> => {
    return Promise.resolve();
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
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const metadataDispatcher = useMetadataDispatcher();
  const apiHelper = useModelApiHelper();
  const mutator = useMutate();

  const repository = useMemo<IUrlRepository>(() => {
    return createRepository({
      ...args,
      backendUrl,
      httpHeaders,
      metadataDispatcher,
      apiHelper,
      mutator,
    });
  }, [args.getListUrl, backendUrl, httpHeaders]);

  return repository;
};

export function withUrlRepository<WrappedProps>(
  WrappedComponent: ComponentType<WrappedProps & IHasRepository>,
): FC<WrappedProps> {
  return wrapDisplayName((props) => {
    const { getDataPath } = props as IHasEntityDataSourceConfig;
    const repository = useUrlRepository({ getListUrl: getDataPath });

    return <WrappedComponent {...props} repository={repository} />;
  }, "withUrlRepository");
}
