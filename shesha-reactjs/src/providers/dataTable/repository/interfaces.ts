import { IConfigurableColumnsProps } from "providers/datatableColumnsConfigurator/models";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse } from "../interfaces";

export interface IRepository {
    prepareColumns: (configurableColumns: IConfigurableColumnsProps[]) => Promise<DataTableColumnDto[]>;
    fetch: (payload: IGetListDataPayload) => Promise<ITableDataInternalResponse>;
    exportToExcel: (payload: IGetListDataPayload) => Promise<void>;
    performUpdate: (rowIndex: number, data: any) => Promise<any>;
    performCreate: (rowIndex: number, data: any) => Promise<any>;
    performDelete: (rowIndex: number, data: any) => Promise<any>;    
};

export interface IHasRepository {
    repository: IRepository;
}