import {
    ColumnSorting,
    DataFetchingMode,
    FilterExpression,
    GroupingItem,
    ISortingItem,
    SortMode
    } from '@/providers/dataTable/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { YesNoInherit } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';

export interface ITableContextComponentProps extends IConfigurableFormComponent {
    sourceType?: 'Form' | 'Entity' | 'Url';
    entityType?: string;
    endpoint?: string;
    customReorderEndpoint?: string;
    components?: IConfigurableFormComponent[]; // If isDynamic we wanna
    dataFetchingMode?: DataFetchingMode;
    defaultPageSize?: number;
    grouping?: GroupingItem[];
    sortMode?: SortMode;
    strictSortBy?: string;
    strictSortOrder?: ColumnSorting;
    standardSorting?: ISortingItem[];
    allowReordering?: YesNoInherit;
    permanentFilter?: FilterExpression;
    disableRefresh?: string;
    onBeforeRowReorder?: IConfigurableActionConfiguration;
    onAfterRowReorder?: IConfigurableActionConfiguration;
}

export interface IBeforeRowReorderArguments<TData = unknown> {
    oldIndex: number;
    newIndex: number;
    rowData: TData;
    allData: TData[];
}

export interface IAfterRowReorderArguments<TData = unknown, TResponse = unknown> {
    oldIndex: number;
    newIndex: number;
    rowData: TData;
    allData: TData[];
    response?: TResponse;
}