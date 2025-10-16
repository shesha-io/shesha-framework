import { HttpClientApi, IHasEntityDataSourceConfig, useHttpClient, useMetadataDispatcher } from "@/providers";
import { IResult } from "@/interfaces/result";
import qs from "qs";
import React, { ComponentType, useMemo, FC } from "react";

import { camelcaseDotNotation } from "@/utils/string";
import { DataTableColumnDto, IExcelColumn, IExportExcelPayload, IGetDataFromBackendPayload, IGetListDataPayload, ITableDataFetchColumn, ITableDataInternalResponse, ITableDataResponse } from "../interfaces";
import { IRepository, IHasRepository, IHasModelType, RowsReorderPayload, EntityReorderPayload, EntityReorderItem, EntityReorderResponse, SupportsReorderingArgs, SupportsGroupingArgs } from "./interfaces";
import { convertDotNotationPropertiesToGraphQL } from "@/providers/form/utils";
import { IConfigurableColumnsProps, IDataColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "@/components/configurableForm/useActionEndpoint";
import { IApiEndpoint, isEntityReferencePropertyMetadata, StandardEntityActions } from "@/interfaces/metadata";
import { IUseMutateResponse, useMutate } from "@/hooks/useMutate";
import { IErrorInfo } from "@/interfaces/errorInfo";
import { IAjaxResponse, isAjaxErrorResponse, isAjaxSuccessResponse, isAxiosResponse } from "@/interfaces/ajaxResponse";
import FileSaver from "file-saver";
import { DataTypes } from "@/interfaces/dataTypes";
import { GENERIC_ENTITIES_ENDPOINT } from "@/shesha-constants";
import { wrapDisplayName } from "@/utils/react";

export interface IWithBackendRepositoryArgs {
  entityType: string;
  getListUrl: string;
  customCreateUrl?: string;
  customUpdateUrl?: string;
  customDeleteUrl?: string;
}

export const BackendRepositoryType = 'backend-repository';

export interface ICreateOptions {
  customUrl?: string;
}
export interface IUpdateOptions {
  customUrl?: string;
}
export interface IDeleteOptions {
  customUrl?: string;
}

export interface IBackendRepository extends IRepository<ICreateOptions, IUpdateOptions, IDeleteOptions> {
  entityType: string;
}

interface ICreateBackendRepositoryArgs extends IWithBackendRepositoryArgs {
  httpClient: HttpClientApi;
  metadataDispatcher: IMetadataDispatcher;
  apiHelper: IEntityEndpointsEvaluator;
  mutator: IUseMutateResponse<any>;
}

const createRepository = (args: ICreateBackendRepositoryArgs): IBackendRepository => {
  const { httpClient, getListUrl, entityType, metadataDispatcher, apiHelper, mutator } = args;

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
      }
    });
    return result;
  };

  /** Convert common payload to a form that uses the back-end */
  const convertPayload = (payload: IGetListDataPayload): IGetDataFromBackendPayload => {
    const properties = getPropertyNamesForFetching(payload.columns);

    const result: IGetDataFromBackendPayload = {
      entityType: entityType,
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
      throw 'Failed to fetch data';

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

  const fetch = async (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
    const getDataPayload = convertPayload(payload);

    const getDataUrl = `${getListUrl || `${GENERIC_ENTITIES_ENDPOINT}/GetAll`}?${qs.stringify(
      getDataPayload,
    )}`;

    const response = await httpClient.get<IAjaxResponse<ITableDataResponse>>(getDataUrl);
    return convertListDataResponse(response.data, payload.pageSize);
  };

  const getPropertyNames = (columns: IConfigurableColumnsProps[]): string[] => {
    const result: string[] = [];
    columns.forEach((col) => {
      const dataCol = col.columnType === 'data'
        ? col as IDataColumnsProps
        : null;
      if (dataCol && dataCol.propertyName)
        result.push(dataCol.propertyName);
    });
    return result;
  };

  const prepareColumns = (configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    if (!entityType)
      return Promise.resolve([]);

    const dataProperties = getPropertyNames(configurableColumns ?? []);
    if (dataProperties.length === 0)
      return Promise.resolve([]);

    // fetch columns config from server
    return metadataDispatcher.getPropertiesMetadata({ dataType: DataTypes.entityReference, modelType: entityType, properties: dataProperties })
      .then((response) => {
        return dataProperties.map<DataTableColumnDto>((p) => {
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
              allowInherited: false, // TODO: add to metadata
              isFilterable: true, // TODO: add to metadata
              isSortable: true, // TODO: add to metadata
              metadata: propMeta,
            }
            : baseProps;
        });
      }).catch((e) => {
        // TODO: return error and handle on the upper level
        console.error('Failed to fetch table columns', e);
        return [];
      });
  };

  const convertError = (error: any): IErrorInfo => {
    return isAxiosResponse(error) && isAjaxErrorResponse(error.data)
      ? error.data.error
      : error;
  };

  const performUpdate = (_rowIndex: number, data: any, options: IUpdateOptions): Promise<any> => {
    const endpointResolver: Promise<IApiEndpoint> = options?.customUrl
      ? Promise.resolve({ httpVerb: 'PUT', url: options.customUrl })
      : apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.update });

    return endpointResolver.then((endpoint) => {
      return mutator.mutate(endpoint, data).then((response) => {
        return response;
      }).catch((error) => {
        throw convertError(error);
      });
    });
  };

  const performDelete = (_rowIndex: number, data: any, options: IDeleteOptions): Promise<any> => {
    const id = data['id'];
    if (!id)
      return Promise.reject('Failed to determine `Id` of the object');

    const endpointResolver: Promise<IApiEndpoint> = options?.customUrl
      ? Promise.resolve({ httpVerb: 'DELETE', url: options.customUrl })
      : apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.delete });

    return endpointResolver.then((endpoint) => {
      const useQueryString = endpoint.httpVerb?.toUpperCase() === 'DELETE';

      const url = useQueryString
        ? `${endpoint.url}?${qs.stringify({ id })}`
        : endpoint.url;
      const data = useQueryString
        ? undefined
        : { id };

      return mutator.mutate({ ...endpoint, url }, data).then((response) => {
        return response;
      }).catch((error) => {
        throw convertError(error);
      });
    });
  };

  const performCreate = (_rowIndex: number, data: any, options: ICreateOptions): Promise<any> => {
    const endpointResolver: Promise<IApiEndpoint> = options?.customUrl
      ? Promise.resolve({ httpVerb: 'POST', url: options.customUrl })
      : apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.create });

    return endpointResolver.then((endpoint) => {
      return mutator.mutate(endpoint, data).then((response) => {
        return response;
      }).catch((error) => {
        throw convertError(error);
      });
    });
  };

  const exportToExcel = async (payload: IGetListDataPayload): Promise<void> => {
    let excelColumns = payload.columns
      .map<IExcelColumn>((c) => ({ propertyName: c.propertyName, label: c.caption }));

    if (excelColumns.findIndex((c) => c.propertyName === 'id') === -1) {
      excelColumns = [{ propertyName: 'id', label: 'Id' }, ...excelColumns];
    }

    const getDataPayload = convertPayload(payload);

    const excelPayload: IExportExcelPayload = {
      ...getDataPayload,
      maxResultCount: 2147483647,
      columns: excelColumns,
    };

    const excelEndpoint = `${GENERIC_ENTITIES_ENDPOINT}/ExportToExcel`;

    const response = await httpClient.post(excelEndpoint, excelPayload, { responseType: 'blob' });
    FileSaver.saveAs(new Blob([response.data]), 'Export.xlsx');
  };

  const reorder = async (payload: RowsReorderPayload): Promise<void> => {
    let reorderUrl = `${GENERIC_ENTITIES_ENDPOINT}/Reorder`;
    if (payload.customReorderEndpoint?.trim().length > 0)
      reorderUrl = payload.customReorderEndpoint;

    const oldRows = payload.getOld();
    const newRows = payload.getNew();
    const reorderedRows: EntityReorderItem[] = [];
    newRows.forEach((row, index) => {
      if (row !== oldRows[index])
        reorderedRows.push({ id: row['id'], orderIndex: row[payload.propertyName] });
    });

    const reorderPayload: EntityReorderPayload = {
      entityType: entityType,
      propertyName: payload.propertyName,
      items: reorderedRows,
    };

    // optimistic update
    payload.applyOrder(newRows);

    try {
      const response = await httpClient.put<IAjaxResponse<EntityReorderResponse>>(reorderUrl, reorderPayload);
      if (isAjaxSuccessResponse(response.data)) {
        const responseItems = response.data.result.items;
        const orderedRows = newRows.map((row) => {
          const newOrder = responseItems[row['id']];
          return newOrder
            ? { ...row, [payload.propertyName]: newOrder }
            : row;
        });
        // real update
        payload.applyOrder(orderedRows);
      }
    } catch (error) {
      payload.applyOrder(oldRows);
      throw error;
    }
  };

  const supportsReordering = (args: SupportsReorderingArgs): boolean | string => {
    return args.sortMode !== 'strict' || !args.strictSortBy
      ? '`sortMode` and `strictSortBy` properties are mandatory for the generic reordering functionality'
      : true;
  };

  const supportsGrouping = (args: SupportsGroupingArgs): boolean => {
    return args.sortMode === "standard" && Boolean(entityType);
  };

  const repository: IBackendRepository = {
    repositoryType: BackendRepositoryType,
    entityType: args.entityType,
    fetch,
    reorder,
    exportToExcel,
    prepareColumns,
    performCreate,
    performUpdate,
    performDelete,
    supportsReordering,
    supportsGrouping,
  };
  return repository;
};

export const useBackendRepository = (args: IWithBackendRepositoryArgs): IBackendRepository => {
  const httpClient = useHttpClient();
  const metadataDispatcher = useMetadataDispatcher();
  const apiHelper = useModelApiHelper();
  const mutator = useMutate();

  const repository = useMemo<IBackendRepository>(() => {
    return createRepository({
      ...args,
      httpClient,
      metadataDispatcher,
      apiHelper,
      mutator,
    });
  }, [args.entityType, httpClient]);

  return repository;
};

export function withBackendRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository & IHasModelType>): FC<WrappedProps> {
  return wrapDisplayName((props) => {
    const { entityType, getDataPath } = props as IHasEntityDataSourceConfig;

    const repository = useBackendRepository({ entityType, getListUrl: getDataPath });
    return (<WrappedComponent {...props} repository={repository} modelType={entityType} />);
  }, "withBackendRepository");
};
