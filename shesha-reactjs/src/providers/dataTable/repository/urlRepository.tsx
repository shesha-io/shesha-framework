import axios from "axios";
import { useMetadataDispatcher, useSheshaApplication } from "providers";
import { IResult } from "interfaces/result";
import { IHttpHeadersDictionary } from "providers/sheshaApplication/contexts";
import qs from "qs";
import React, { ComponentType, useMemo } from "react";
import { FC } from "react";
import { camelcaseDotNotation } from "utils/string";
import { DataTableColumnDto, IGetDataFromUrlPayload, IGetListDataPayload, ITableDataColumn, ITableDataInternalResponse, ITableDataResponse } from "../interfaces";
import { IRepository, IHasRepository } from "./interfaces";
import { convertDotNotationPropertiesToGraphQL } from "providers/form/utils";
import { IConfigurableColumnsProps } from "providers/datatableColumnsConfigurator/models";
import { IMetadataDispatcherActionsContext } from "providers/metadataDispatcher/contexts";
import { IEntityEndpointsEvaluator, useModelApiHelper } from "components/configurableForm/useActionEndpoint";
import { IUseMutateResponse, useMutate } from "hooks/useMutate";

export interface IWithUrlRepositoryArgs {
    getListUrl: string;
}

export interface IUrlRepository extends IRepository {
}

interface ICreateUrlRepositoryArgs extends IWithUrlRepositoryArgs {
    backendUrl: string;
    httpHeaders: IHttpHeadersDictionary;
    metadataDispatcher: IMetadataDispatcherActionsContext;
    apiHelper: IEntityEndpointsEvaluator;
    mutator: IUseMutateResponse<any>;
}

const createRepository = (args: ICreateUrlRepositoryArgs): IUrlRepository => {
    const { backendUrl, httpHeaders, getListUrl } = args;

    const getPropertyNamesForFetching = (columns: ITableDataColumn[]): string[] => {
        const result: string[] = [];
        columns.forEach(column => {
            result.push(column.propertyName);

            // special handling for entity references: expand properties list to include `id` and `_displayName`
            if (column.dataType === 'entity') {
                const requiredProps = [`${column.propertyName}.Id`, `${column.propertyName}._displayName`];
                requiredProps.forEach(rp => {
                    if (!result.includes(rp))
                        result.push(rp);
                });
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
                .filter(s => Boolean(s.id))
                .map(s => camelcaseDotNotation(s.id) + (s.desc ? ' desc' : ''))
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
        if (!response.result)
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
        const getDataPayload = convertPayload(payload);

        const getDataUrl = `${backendUrl}${getListUrl}?${qs.stringify(
            getDataPayload
        )}`;

        return axios({
            url: getDataUrl,
            method: 'GET',
            headers: httpHeaders,
        }).then(response => {
            const dataResponse = response.data as IResult<ITableDataResponse>;
            return convertListDataResponse(dataResponse, payload.pageSize);
        });
    };

    // ToDo: have to be implemented
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

    const repository: IUrlRepository = {
        fetch,
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

export function withUrlRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository>, args: IWithUrlRepositoryArgs): FC<WrappedProps> {
    return props => {
        const repository = useUrlRepository(args);
        return (<WrappedComponent {...props} repository={repository} />);
    };
};