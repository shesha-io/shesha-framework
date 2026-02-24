import axios from 'axios';
import { IHasEntityDataSourceConfig, useMetadataDispatcher, useSheshaApplication } from '@/providers';
import { IResult } from '@/interfaces/result';
import { IHttpHeadersDictionary } from '@/providers/sheshaApplication/contexts';
import qs from 'qs';
import React, { ComponentType, useMemo } from 'react';
import { FC } from 'react';
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
import { IConfigurableColumnsProps, IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { IMetadataDispatcher } from '@/providers/metadataDispatcher/contexts';
import { IEntityEndpointsEvaluator, useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import { isEntityReferencePropertyMetadata } from '@/interfaces/metadata';
import { DataTypes } from '@/interfaces/dataTypes';
import { IUseMutateResponse, useMutate } from '@/hooks/useMutate';
import { getUrlKeyParam } from '@/utils';

export interface IWithUrlRepositoryArgs {
  getListUrl: string;
  entityType?: string;
}

export const UrlRepositoryType = 'url-repository';

export interface IUrlRepository extends IRepository { }

interface ICreateUrlRepositoryArgs extends IWithUrlRepositoryArgs {
  backendUrl: string;
  httpHeaders: IHttpHeadersDictionary;
  metadataDispatcher: IMetadataDispatcher;
  apiHelper: IEntityEndpointsEvaluator;
  mutator: IUseMutateResponse<any>;
}

const createRepository = (args: ICreateUrlRepositoryArgs): IUrlRepository => {
  const { backendUrl, httpHeaders, getListUrl, entityType, metadataDispatcher } = args;

  const getPropertyNamesForFetching = (columns: ITableDataFetchColumn[]): string[] => {
    const result: string[] = [];
    columns.forEach(column => {
      if (!column.propertiesToFetch)
        return;
      if (Array.isArray(column.propertiesToFetch)) {
        column.propertiesToFetch.forEach(p => {
          if (!!p)
            result.push(p);
        });
      } else {
        result.push(column.propertiesToFetch);
        // special handling for entity references: expand properties list to include `id` and `_displayName`
        if (column.isEnitty) {
          const requiredProps = [`${column.propertiesToFetch}.Id`, `${column.propertiesToFetch}._displayName`];
          requiredProps.forEach(rp => {
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
    pageSize: number
  ): ITableDataInternalResponse => {
    if (!response.result) throw 'Failed to parse response';

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

  const getPropertyNames = (columns: IConfigurableColumnsProps[]): string[] => {
    const result: string[] = [];
    columns.forEach(col => {
      const dataCol = col.columnType === 'data'
        ? col as IDataColumnsProps
        : null;
      if (dataCol && dataCol.propertyName)
        result.push(dataCol.propertyName);
    });
    return result;
  };

  const prepareColumns = (configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    const dataProperties = getPropertyNames(configurableColumns ?? []);
    if (dataProperties.length === 0)
      return Promise.resolve([]);

    if (entityType) {
      return metadataDispatcher.getPropertiesMetadata({ dataType: DataTypes.entityReference, modelType: entityType, properties: dataProperties })
        .then(response => {
          return dataProperties.map<DataTableColumnDto>(p => {
            const baseProps = {
              propertyName: p,
              name: p,
            };
            const propMeta = response[p];
            return propMeta
              ? {
                  ...baseProps,
                  caption: propMeta.label,
                  description: propMeta.description,
                  dataType: propMeta.dataType,
                  dataFormat: propMeta.dataFormat,
                  referenceListName: propMeta.referenceListName,
                  referenceListModule: propMeta.referenceListModule,
                  entityReferenceTypeShortAlias: isEntityReferencePropertyMetadata(propMeta) ? propMeta.entityType : undefined,
                  allowInherited: false,
                  isFilterable: true,
                  isSortable: true,
                  metadata: propMeta,
                }
              : baseProps;
          });
        }).catch(e => {
          console.error('Failed to fetch table columns', e);
          return [];
        });
    }

    const dataColumns = configurableColumns
      .filter(col => col.columnType === 'data')
      .map(col => {
        const dataCol = col as IDataColumnsProps;

        const result: DataTableColumnDto = {
          propertyName: dataCol.propertyName || col.id,
          name: dataCol.propertyName || col.id,
          caption: col.caption || dataCol.propertyName || col.id,
          description: col.description || null,
          dataType: 'string',
          dataFormat: null,
          referenceListName: null,
          referenceListModule: null,
          entityReferenceTypeShortAlias: null,
          allowInherited: false,
          isFilterable: true,
          isSortable: dataCol.allowSorting !== false,
          metadata: null,
        };

        return result;
      });

    return Promise.resolve(dataColumns);
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

  const reorder = (_payload: RowsReorderPayload) => {
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
  }, [args.getListUrl, args.entityType, backendUrl, httpHeaders]);

  return repository;
};

export function withUrlRepository<WrappedProps>(
  WrappedComponent: ComponentType<WrappedProps & IHasRepository>
): FC<WrappedProps> {
  return (props) => {
    const { getDataPath, entityType } = props as IHasEntityDataSourceConfig;
    const repository = useUrlRepository({ getListUrl: getDataPath, entityType });

    return <WrappedComponent {...props} repository={repository} />;
  };
}
