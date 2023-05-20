import { IConfigurableColumnsProps } from "providers/datatableColumnsConfigurator/models";
import React, { ComponentType, useMemo } from "react";
import { FC } from "react";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";
import { IHasModelType, IHasRepository, IRepository } from "./interfaces";

export interface IWithInMemoryRepositoryArgs {
    value?: object;
}

const createRepository = (_args: IWithInMemoryRepositoryArgs): IRepository => {
    const fetch = (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {

        console.log('useInMemoryRepository.fetchDataTableData()', payload);

        return Promise.reject('Not implemented');
    };

    const prepareColumns = (_configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
        return Promise.reject('Not implemented');
    };

    const performUpdate = (rowIndex: number, data: any): Promise<any> => {
        console.log('LOG: update', { rowIndex, data });
        return Promise.reject('update is not implemented');
    };

    const performDelete = (rowIndex: number, data: any): Promise<any> => {
        console.log('LOG: delete', { rowIndex, data });
        return Promise.reject('Delete is not implemented');
    };

    const performCreate = (rowIndex: number, data: any): Promise<any> => {
        console.log('LOG: create', { rowIndex, data });
        return Promise.reject('Create not implemented');
    };

    const exportToExcel = (payload: IGetListDataPayload): Promise<void> => {
        console.log('LOG: useInMemoryRepository.exportToExcel()', payload);

        return  Promise.reject('Export to Excel not implemented');
    };

    const repository: IRepository = {
        repositoryType: 'inMemory-repository',
        fetch,
        exportToExcel,
        prepareColumns,
        performCreate,
        performUpdate,
        performDelete,
    };
    return repository;
};

export const useInMemoryRepository = (args: IWithInMemoryRepositoryArgs): IRepository => useMemo<IRepository>(() => createRepository(args), []);

export function withInMemoryRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository & IHasModelType>, args: IWithInMemoryRepositoryArgs): FC<WrappedProps> {
    const { value } = args;

    return props => {
        const repository = useInMemoryRepository({ value });

        return (<WrappedComponent {...props} repository={repository} modelType={null}/>);
    };
};

