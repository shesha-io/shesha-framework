import { IConfigurableColumnsProps } from "providers/datatableColumnsConfigurator/models";
import React, { ComponentType, useMemo } from "react";
import { FC } from "react";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";
import { IHasRepository, IRepository } from "./interfaces";

export interface IWithNullRepositoryArgs {
    value?: object;
}

const createRepository = (_args: IWithNullRepositoryArgs): IRepository => {
    const fetch = (_payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
        return Promise.reject('NullRepository has no implementation');
    };

    const prepareColumns = (_configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
        return Promise.reject('NullRepository has no implementation');
    };

    const performUpdate = (_rowIndex: number, _data: any): Promise<any> => {
        return Promise.reject('NullRepository has no implementation');
    };

    const performDelete = (_rowIndex: number, _data: any): Promise<any> => {
        return Promise.reject('NullRepository has no implementation');
    };

    const performCreate = (_rowIndex: number, _data: any): Promise<any> => {
        return Promise.reject('NullRepository has no implementation');
    };

    const exportToExcel = (_payload: IGetListDataPayload): Promise<void> => {
        return Promise.reject('NullRepository has no implementation');
    };

    const repository: IRepository = {
        fetch,
        exportToExcel,
        prepareColumns,
        performCreate,
        performUpdate,
        performDelete,
    };
    return repository;
};

export const useNullRepository = (args: IWithNullRepositoryArgs): IRepository => useMemo<IRepository>(() => createRepository(args), []);

export function withNullRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository>, args: IWithNullRepositoryArgs): FC<WrappedProps> {
    const { value } = args;

    return props => {
        const repository = useNullRepository({ value });

        return (<WrappedComponent {...props} repository={repository} />);
    };
};

