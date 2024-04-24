import { IConfigurableColumnsProps, IDataColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import React, { ComponentType, useCallback, useMemo } from "react";
import { FC } from "react";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";
import { IHasModelType, IHasRepository, IRepository, RowsReorderPayload, SupportsReorderingArgs } from "./interfaces";
import { IHasFormDataSourceConfig } from "@/providers";

export interface IWithInMemoryRepositoryArgs {
    valueAccessor: () => object[];
    onChange: (value: object[]) => void;
}

const createRepository = (args: IWithInMemoryRepositoryArgs): IRepository => {
    const fetch = (payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
        const { currentPage, pageSize /*, columns, filter, quickSearch, sorting*/ } = payload;

        let allRows = args.valueAccessor() ?? [];

        const filteredRows = allRows;

        // apply filter

        // apply sorting

        // apply pagination
        if (pageSize > 0) {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = startIndex + pageSize <= allRows.length
                ? startIndex + pageSize
                : allRows.length;

            allRows = allRows.slice(startIndex, endIndex);
        }

        const response: ITableDataInternalResponse = {
            totalPages: Math.ceil(filteredRows.length / pageSize),
            totalRows: filteredRows.length,
            totalRowsBeforeFilter: allRows.length,
            rows: filteredRows
        };

        return Promise.resolve(response);
    };

    const prepareColumns = (configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
        const converted: DataTableColumnDto[] = [];

        configurableColumns.forEach(col => {
            const dataCol = col.columnType === 'data'
                ? col as IDataColumnsProps
                : null;
            if (dataCol) {
                converted.push({
                    propertyName: dataCol.propertyName,
                    name: dataCol.propertyName,
                    caption: dataCol.caption,
                    description: null,
                    dataType: 'string',
                    dataFormat: null,
                    referenceListName: null,
                    referenceListModule: null,
                    entityReferenceTypeShortAlias: null,
                    allowInherited: false, // todo: add to metadata
                    isFilterable: true, // todo: add to metadata
                    isSortable: true, // todo: add to metadata 
                });
            }
        });

        return Promise.resolve(converted);
    };

    const performUpdate = (rowIndex: number, data: any): Promise<any> => {
        const newRows = [...args.valueAccessor() ?? []];
        newRows[rowIndex] = data;
        args.onChange(newRows);

        return Promise.resolve(data);
    };

    const performDelete = (rowIndex: number, data: any): Promise<any> => {
        const newRows = [...args.valueAccessor() ?? []];
        newRows.splice(rowIndex, 1);
        args.onChange(newRows);

        return Promise.resolve(data);
    };

    const performCreate = (_rowIndex: number, data: any): Promise<any> => {
        const newRows = [...args.valueAccessor() ?? []];
        newRows.push(data);

        args.onChange(newRows);

        return Promise.resolve(data);
    };

    const exportToExcel = (_payload: IGetListDataPayload): Promise<void> => {
        return Promise.reject('Export to Excel not implemented');
    };

    const reorder = (payload: RowsReorderPayload) => {
        const newRows = payload.getNew();
        args.onChange(newRows);

        payload.applyOrder(newRows);
        return Promise.resolve();
    };

    const supportsReordering = (_args: SupportsReorderingArgs) => {
        return true;
    };

    const repository: IRepository = {
        repositoryType: 'inMemory-repository',
        fetch,
        reorder,
        exportToExcel,
        prepareColumns,
        performCreate,
        performUpdate,
        performDelete,
        supportsReordering,
    };
    return repository;
};

export const useInMemoryRepository = (args: IWithInMemoryRepositoryArgs): IRepository => useMemo<IRepository>(() => createRepository(args), []);

export function withInMemoryRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository & IHasModelType>, args: IWithInMemoryRepositoryArgs): FC<WrappedProps> {
    const { valueAccessor, onChange } = args;

    return props => {
        const repository = useInMemoryRepository({ valueAccessor, onChange });

        return (<WrappedComponent {...props} repository={repository} modelType={null} />);
    };
};


export interface IWithFormFieldRepositoryArgs {
    propertyName: string;
    getFieldValue?: (propertyName: string) => object[];
    onChange?: (...args: any[]) => void;
}
export function withFormFieldRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository & IHasModelType>): FC<WrappedProps> {
    return props => {
        const { propertyName, getFieldValue, onChange } = props as IHasFormDataSourceConfig;
        
        const valueAccessor = useCallback(() => getFieldValue(propertyName), [propertyName]);
        const onChangeAccessor = useCallback((newValue: object[]) => {
            if (onChange)
                onChange(newValue);
        }, [propertyName]);

        const repository = useInMemoryRepository({ valueAccessor, onChange: onChangeAccessor });

        return (<WrappedComponent {...props} repository={repository} modelType={null} />);
    };
};