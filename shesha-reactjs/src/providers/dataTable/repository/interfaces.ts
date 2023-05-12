import { IConfigurableColumnsProps } from "providers/datatableColumnsConfigurator/models";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";

export interface IRepository<TCreateOptions = any, TUpdateOptions = any, TDeleteOptions = any> {
    repositoryType: string;
    prepareColumns: (configurableColumns: IConfigurableColumnsProps[]) => Promise<DataTableColumnDto[]>;
    fetch: (payload: IGetListDataPayload) => Promise<ITableDataInternalResponse>;
    exportToExcel: (payload: IGetListDataPayload) => Promise<void>;
    performCreate: (rowIndex: number, data: any, options: TCreateOptions) => Promise<any>;
    performUpdate: (rowIndex: number, data: any, options: TUpdateOptions) => Promise<any>;    
    performDelete: (rowIndex: number, data: any, options: TDeleteOptions) => Promise<any>;    
};

export interface IHasRepository {
    repository: IRepository;
}