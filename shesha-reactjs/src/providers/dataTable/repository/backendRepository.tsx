import { IEntityEndpointsEvaluator, useModelApiHelper } from "@/components/configurableForm/useActionEndpoint";
import { extractAjaxResponse, IAjaxResponse, isAjaxSuccessResponse } from "@/interfaces/ajaxResponse";
import { DataTypes } from "@/interfaces/dataTypes";
import { IGenericGetAllPayload } from "@/interfaces/gql";
import { IApiEndpoint, isEntityReferencePropertyMetadata, StandardEntityActions } from "@/interfaces/metadata";
import { HttpClientApi, IHasEntityDataSourceConfig, useHttpClient, useMetadataDispatcher } from "@/providers";
import { IConfigurableColumnsProps, IDataColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { convertDotNotationPropertiesToGraphQL } from "@/providers/form/utils";
import { IMetadataDispatcher } from "@/providers/metadataDispatcher/contexts";
import { getEntityTypeIdentifierQueryParams } from "@/providers/metadataDispatcher/entities/utils";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { GENERIC_ENTITIES_ENDPOINT } from "@/shesha-constants";
import { buildUrl } from "@/utils";
import { isNonEmptyArray } from "@/utils/array";
import { getIdOrUndefined } from "@/utils/entity";
import { extractErrorInfo } from "@/utils/errors";
import { callApiEndpoint } from "@/utils/fetchers";
import { isNullOrWhiteSpace } from "@/utils/nullables";
import { camelcaseDotNotation, getNumberOrUndefined } from "@/utils/string";
import FileSaver from "file-saver";
import React, { FC, PropsWithChildren, useMemo } from "react";
import { DataTableColumnDto, IExcelColumn, IExportExcelPayload, IGetListDataPayload, isDataColumn, ITableDataFetchColumn, ITableDataInternalResponse, ITableDataResponse } from "../interfaces";
import { DataTableProviderWithRepository, IDataTableProviderWithRepositoryProps } from "../provider";
import { EntityReorderItem, EntityReorderPayload, EntityReorderResponse, IRepository, RowsReorderPayload, SupportsGroupingArgs, SupportsReorderingArgs } from "./interfaces";

export interface IWithBackendRepositoryArgs {
  entityType: string | IEntityTypeIdentifier;
  getListUrl: string;
  customCreateUrl?: string | undefined;
  customUpdateUrl?: string | undefined;
  customDeleteUrl?: string | undefined;
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
  entityType: string | IEntityTypeIdentifier;
}

interface ICreateBackendRepositoryArgs extends IWithBackendRepositoryArgs {
  httpClient: HttpClientApi;
  metadataDispatcher: IMetadataDispatcher;
  apiHelper: IEntityEndpointsEvaluator;
}

const createRepository = (args: ICreateBackendRepositoryArgs): IBackendRepository => {
  const { httpClient, getListUrl, entityType, metadataDispatcher, apiHelper } = args;

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
  const convertPayload = (payload: IGetListDataPayload): IGenericGetAllPayload => {
    const properties = getPropertyNamesForFetching(payload.columns);

    const result: IGenericGetAllPayload = {
      ...getEntityTypeIdentifierQueryParams(entityType),
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
    const getDataPayload = await convertPayload(payload);

    const getDataUrl = buildUrl(getListUrl || `${GENERIC_ENTITIES_ENDPOINT}/GetAll`, getDataPayload);

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

    const dataProperties = getPropertyNames(configurableColumns);
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
          if (!propMeta)
            return baseProps;

          const fullProps: DataTableColumnDto = {
            ...baseProps,
            caption: propMeta.label ?? null,
            description: propMeta.description ?? null,
            dataType: propMeta.dataType,
            dataFormat: propMeta.dataFormat ?? null,
            referenceListName: propMeta.referenceListName ?? null,
            referenceListModule: propMeta.referenceListModule ?? null,
            entityTypeName: isEntityReferencePropertyMetadata(propMeta) ? propMeta.entityType ?? null : null,
            entityTypeModule: isEntityReferencePropertyMetadata(propMeta) ? propMeta.entityModule ?? null : null,
            allowInherited: false, // TODO: add to metadata
            isFilterable: true, // TODO: add to metadata
            isSortable: true, // TODO: add to metadata
            metadata: propMeta,
          };

          return fullProps;
        });
      }).catch((e) => {
        // TODO: return error and handle on the upper level
        console.error('Failed to fetch table columns', e);
        return [];
      });
  };

  const mutate = async <TData extends object = object, TResponse extends object = object>(endpoint: IApiEndpoint, data?: TData): Promise<TResponse> => {
    return await callApiEndpoint(httpClient, endpoint, data);
  };

  const performUpdate = async <TData extends object = object>(_rowIndex: number, data: TData, options?: IUpdateOptions): Promise<TData> => {
    const endpoint: IApiEndpoint = options?.customUrl
      ? { httpVerb: 'PUT', url: options.customUrl }
      : await apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.update });

    try {
      return await mutate(endpoint, data);
    } catch (error) {
      throw extractErrorInfo(error);
    }
  };

  const performDelete = async <TData extends object = object>(_rowIndex: number, data: TData, options?: IDeleteOptions): Promise<TData> => {
    const id = getIdOrUndefined(data);
    if (!id)
      return Promise.reject('Failed to determine `Id` of the object');

    const endpoint: IApiEndpoint = options?.customUrl
      ? { httpVerb: 'DELETE', url: options.customUrl }
      : await apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.delete });

    try {
      return await mutate(endpoint, { id });
    } catch (error) {
      throw extractErrorInfo(error);
    }
  };

  const performCreate = async <TData extends object = object>(_rowIndex: number, data: TData, options?: ICreateOptions): Promise<TData> => {
    const endpoint: IApiEndpoint = options?.customUrl
      ? { httpVerb: 'POST', url: options.customUrl }
      : await apiHelper.getDefaultActionUrl({ modelType: entityType, actionName: StandardEntityActions.create });

    try {
      return await mutate(endpoint, data);
    } catch (error) {
      throw extractErrorInfo(error);
    }
  };

  const exportToExcel = async (payload: IGetListDataPayload): Promise<void> => {
    let excelColumns: IExcelColumn[] = [];

    for (const prop of payload.columns) {
      if (isDataColumn(prop) && !isNullOrWhiteSpace(prop.propertyName))
        excelColumns.push({ propertyName: prop.propertyName, label: prop.caption ?? "" });
    }

    if (excelColumns.findIndex((c) => c.propertyName === 'id') === -1) {
      excelColumns = [{ propertyName: 'id', label: 'Id' }, ...excelColumns];
    }

    const getDataPayload = await convertPayload(payload);

    const excelPayload: IExportExcelPayload = {
      entityTypeId: getEntityTypeIdentifierQueryParams(entityType),
      skipCount: getDataPayload.skipCount,
      properties: getDataPayload.properties,
      quickSearch: getDataPayload.quickSearch,
      sorting: getDataPayload.sorting,
      filter: getDataPayload.filter,
      maxResultCount: 2147483647,
      columns: excelColumns,
    };

    const excelEndpoint = `${GENERIC_ENTITIES_ENDPOINT}/ExportToExcel`;

    const response = await httpClient.post<BlobPart>(excelEndpoint, excelPayload, { responseType: 'blob' });
    FileSaver(new Blob([response.data]), 'Export.xlsx', { autoBom: false });
  };

  const reorder = async (payload: RowsReorderPayload): Promise<void> => {
    let reorderUrl = `${GENERIC_ENTITIES_ENDPOINT}/Reorder`;
    if (!isNullOrWhiteSpace(payload.customReorderEndpoint))
      reorderUrl = payload.customReorderEndpoint;

    const oldRows = payload.getOld();
    const newRows = payload.getNew();
    const reorderedRows: EntityReorderItem[] = [];
    newRows.forEach((row, index) => {
      if (row !== oldRows[index]) {
        const id = getIdOrUndefined(row);
        if (isNullOrWhiteSpace(id))
          throw new Error('Failed to determine `Id` of the object');
        const orderIndex = getNumberOrUndefined((row as Record<string, unknown>)[payload.propertyName]);
        if (!orderIndex)
          throw new Error('Failed to determine `orderIndex` of the object');

        reorderedRows.push({ id, orderIndex });
      }
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
          const rowId = getIdOrUndefined(row);
          const newOrder = rowId ? responseItems[rowId] : undefined;
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


  const supportsReordering = (args: SupportsReorderingArgs): string | true => {
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
  const { entityType, getListUrl, customCreateUrl, customUpdateUrl, customDeleteUrl } = args;

  const repository = useMemo<IBackendRepository>(() => {
    return createRepository({
      entityType, getListUrl, customCreateUrl, customUpdateUrl, customDeleteUrl,
      httpClient,
      metadataDispatcher,
      apiHelper,
    });
  }, [apiHelper, entityType, getListUrl, customCreateUrl, customUpdateUrl, customDeleteUrl, httpClient, metadataDispatcher]);

  return repository;
};

export const BackendDataSourceTable: FC<IHasEntityDataSourceConfig & PropsWithChildren<Omit<IDataTableProviderWithRepositoryProps, 'repository'>>> = (props) => {
  const { entityType, getDataPath, ...restProps } = props;

  const repository = useBackendRepository({ entityType, getListUrl: getDataPath ?? "" });

  return <DataTableProviderWithRepository {...restProps} repository={repository} />;
};
