import { IConfigurableColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import React, { ComponentType, useMemo, FC } from "react";

import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";
import { IHasRepository, IRepository, RowsReorderPayload } from "./interfaces";
import { wrapDisplayName } from "@/utils/react";

export interface IWithNullRepositoryArgs {
  value?: object | undefined;
}

const HAS_NO_IMPLEMENTATION_MESSAGE = 'NullRepository has no implementation';

const createRepository = (_args: IWithNullRepositoryArgs): IRepository => {
  const fetch = (_payload: IGetListDataPayload): Promise<ITableDataInternalResponse> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const prepareColumns = (_configurableColumns: IConfigurableColumnsProps[]): Promise<DataTableColumnDto[]> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const performUpdate = <TData extends object = object>(_rowIndex: number, _data: TData): Promise<TData> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const performDelete = <TData extends object = object>(_rowIndex: number, _data: TData): Promise<TData> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const performCreate = <TData extends object = object>(_rowIndex: number, _data: TData): Promise<TData> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const exportToExcel = (_payload: IGetListDataPayload): Promise<void> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const reorder = (_payload: RowsReorderPayload): Promise<void> => {
    return Promise.reject(HAS_NO_IMPLEMENTATION_MESSAGE);
  };

  const repository: IRepository = {
    repositoryType: 'null-repository',
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

export const useNullRepository = (args: IWithNullRepositoryArgs): IRepository => useMemo<IRepository>(() => createRepository(args), [args]);

export function withNullRepository<WrappedProps>(WrappedComponent: ComponentType<WrappedProps & IHasRepository>, args: IWithNullRepositoryArgs): FC<WrappedProps> {
  const { value } = args;

  const Component: FC<WrappedProps> = (props) => {
    const repository = useNullRepository({ value });

    return <WrappedComponent {...props} repository={repository} />;
  };
  return wrapDisplayName<WrappedProps>(Component, "withNullRepository");
};

