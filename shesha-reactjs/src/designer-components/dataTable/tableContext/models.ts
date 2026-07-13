import {
  ColumnSorting,
  DataFetchingMode,
  FilterExpression,
  GroupingItem,
  ISortingItem,
  ITableRowData,
  SortMode,
} from '@/providers/dataTable/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ComponentDefinition, YesNoInherit } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export interface ITableContextComponentProps extends Omit<IConfigurableFormComponent, 'description'> {
  sourceType?: 'Form' | 'Entity' | 'Url' | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  endpoint?: string | undefined;
  customReorderEndpoint?: string | undefined;
  components?: IConfigurableFormComponent[] | undefined; // If isDynamic we wanna
  dataFetchingMode?: DataFetchingMode | undefined;
  defaultPageSize?: number | undefined;
  grouping?: GroupingItem[] | undefined;
  sortMode?: SortMode | undefined;
  strictSortBy?: string | undefined;
  strictSortOrder?: ColumnSorting | undefined;
  standardSorting?: ISortingItem[] | undefined;
  allowReordering?: YesNoInherit | undefined;
  permanentFilter?: FilterExpression | undefined;
  disableRefresh?: string | undefined;
  onBeforeRowReorder?: IConfigurableActionConfiguration | undefined;
  onAfterRowReorder?: IConfigurableActionConfiguration | undefined;
}

export interface IBeforeRowReorderArguments {
  oldIndex: number;
  newIndex: number;
  rowData: ITableRowData | undefined;
  allData: ITableRowData[];
}

export interface IAfterRowReorderArguments {
  oldIndex: number;
  newIndex: number;
  rowData: ITableRowData | undefined;
  allData: ITableRowData[];
  response?: void;
}

/**
 * Legacy DataTable Context component definition (datatableContext)
 * @deprecated Use TableContextComponentDefinition instead. This is kept only for migration of existing forms.
 */
export type TableContextComponentLegacyDefinition = ComponentDefinition<"datatableContext", ITableContextComponentProps>;

/**
 * Data Context component definition (dataContext)
 * This is the new clean implementation of the data context component.
 */
export type TableContextComponentDefinition = ComponentDefinition<'dataContext', ITableContextComponentProps>;
