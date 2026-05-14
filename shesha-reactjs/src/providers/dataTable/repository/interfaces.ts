import { IConfigurableColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { IDictionary } from "@/interfaces";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse, ITableRowData, SortMode } from "../interfaces";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";

export interface RowsReorderPayload {
  propertyName: string;
  getOld: () => ITableRowData[];
  getNew: () => ITableRowData[];
  applyOrder: (orderedItems: ITableRowData[]) => void;
  customReorderEndpoint?: string | undefined;
}

export type DefaultCreateOptions = object;
export type DefaultUpdateOptions = object;
export type DefaultDeleteOptions = object;

export interface IRepository<TCreateOptions extends DefaultCreateOptions = DefaultCreateOptions, TUpdateOptions extends DefaultUpdateOptions = DefaultUpdateOptions, TDeleteOptions extends DefaultDeleteOptions = DefaultDeleteOptions> {
  repositoryType: string;
  prepareColumns: (configurableColumns: IConfigurableColumnsProps[]) => Promise<DataTableColumnDto[]>;
  fetch: (payload: IGetListDataPayload) => Promise<ITableDataInternalResponse>;
  exportToExcel: (payload: IGetListDataPayload) => Promise<void>;
  reorder: (payload: RowsReorderPayload) => Promise<void>;
  supportsReordering?: (args: SupportsReorderingArgs) => boolean | string;
  supportsGrouping?: (args: SupportsGroupingArgs) => boolean;
  performCreate: <TData extends ITableRowData = ITableRowData>(rowIndex: number, data: TData, options?: TCreateOptions) => Promise<TData>;
  performUpdate: <TData extends ITableRowData = ITableRowData>(rowIndex: number, data: TData, options?: TUpdateOptions) => Promise<TData>;
  performDelete: <TData extends ITableRowData = ITableRowData>(rowIndex: number, data: TData, options?: TDeleteOptions) => Promise<TData>;
};

export interface IHasModelType {
  modelType?: string | IEntityTypeIdentifier | undefined;
}

export interface IHasRepository {
  repository: IRepository;
}

export interface EntityReorderItem {
  id: string;
  orderIndex: number;
}
export interface EntityReorderPayload {
  entityType: string | IEntityTypeIdentifier;
  propertyName: string;
  items: EntityReorderItem[];
}
export interface EntityReorderResponse {
  items: IDictionary<number>;
}

export interface SupportsReorderingArgs {
  sortMode?: SortMode | undefined;
  strictSortBy?: string | undefined;
}

export interface SupportsGroupingArgs {
  sortMode?: SortMode | undefined;
}
