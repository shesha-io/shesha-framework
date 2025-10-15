import { IConfigurableColumnsProps } from "@/providers/datatableColumnsConfigurator/models";
import { IDictionary } from "@/interfaces";
import { DataTableColumnDto, IGetListDataPayload, ITableDataInternalResponse, SortMode } from "../interfaces";

export interface RowsReorderPayload {
  propertyName: string;
  getOld: () => object[];
  getNew: () => object[];
  applyOrder: (orderedItems: object[]) => void;
  customReorderEndpoint?: string;
}

export interface IRepository<TCreateOptions = any, TUpdateOptions = any, TDeleteOptions = any> {
  repositoryType: string;
  prepareColumns: (configurableColumns: IConfigurableColumnsProps[]) => Promise<DataTableColumnDto[]>;
  fetch: (payload: IGetListDataPayload) => Promise<ITableDataInternalResponse>;
  exportToExcel: (payload: IGetListDataPayload) => Promise<void>;
  reorder: (payload: RowsReorderPayload) => Promise<void>;
  supportsReordering?: (args: SupportsReorderingArgs) => boolean | string;
  supportsGrouping?: (args: SupportsGroupingArgs) => boolean;
  performCreate: (rowIndex: number, data: any, options: TCreateOptions) => Promise<any>;
  performUpdate: (rowIndex: number, data: any, options: TUpdateOptions) => Promise<any>;
  performDelete: (rowIndex: number, data: any, options: TDeleteOptions) => Promise<any>;
};

export interface IHasModelType {
  modelType: string;
}

export interface IHasRepository {
  repository: IRepository;
}

export interface EntityReorderItem {
  id: string;
  orderIndex: number;
}
export interface EntityReorderPayload {
  entityType: string;
  propertyName: string;
  items: EntityReorderItem[];
}
export interface EntityReorderResponse {
  items: IDictionary<number>;
}

export interface SupportsReorderingArgs {
  sortMode?: SortMode;
  strictSortBy?: string;
}

export interface SupportsGroupingArgs {
  sortMode?: SortMode;
}
