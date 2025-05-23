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

export interface ITableContextComponentProps extends Omit<IConfigurableFormComponent, 'description'> {
    sourceType?: 'Form' | 'Entity' | 'Url';
    entityType?: string;
    endpoint?: string;
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
}