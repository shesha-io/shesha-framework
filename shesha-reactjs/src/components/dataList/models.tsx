import { RefObject } from 'react';
import { FormIdentifier, IStyleType } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { ISelectionProps, RowSelection } from '@/providers/dataTable/interfaces';
import { ISortingItem, ITableRowData } from '@/providers/dataTable/interfaces';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';

export type DataListSelectionMode = 'none' | 'single' | 'multiple';
export type FormSelectionMode = 'name' | 'view' | 'expression';
export type Orientation = 'vertical' | 'horizontal' | 'wrap';
export type ListItemWidth = number | 'custom';
export type InlineEditMode = 'one-by-one' | 'all-at-once';
export type InlineSaveMode = 'auto' | 'manual';
export type NewItemInitializer<TValue extends object = object> = () => Promise<TValue>;

export type ActionRefType = {
  addNewItem: () => void;
};

export interface IDataListProps extends IDataListBaseProps, IDataListActions {
  records?: ITableRowData[] | undefined;
  groupingMetadata: IPropertyMetadata[];
  selectedRow?: ISelectionProps | undefined;
  selectedRows?: ITableRowData[] | undefined;

  isFetchingTableData?: boolean;

  selectedIds?: string[] | undefined;
  showEditIcons?: boolean | undefined;

  canDeleteInline?: boolean | undefined;
  canEditInline?: boolean | undefined;
  canAddInline?: boolean | undefined;

  allowChangeEditMode?: boolean | undefined;

  actionRef?: RefObject<ActionRefType | undefined> | undefined;

  modalWidth?: string | undefined;
  noDataText?: string | undefined;
  noDataSecondaryText?: string | undefined;
  noDataIcon?: string | undefined;
}

export interface IDataListBaseProps extends IStyleType {
  id: string;
  dataSource?: string | undefined;
  formSelectionMode?: FormSelectionMode | undefined;
  formId?: FormIdentifier | undefined;
  formType?: string | undefined;
  formIdExpression?: string | undefined;
  createFormId?: FormIdentifier | undefined;
  createFormType?: string | undefined;
  selectionMode?: DataListSelectionMode | undefined;
  grouping?: ISortingItem[] | undefined;
  entityType?: string | IEntityTypeIdentifier | undefined;
  orientation?: Orientation | undefined;
  listItemWidth?: ListItemWidth | undefined;
  customListItemWidth?: number | undefined;
  cardMinWidth?: string | undefined;
  cardMaxWidth?: string | undefined;
  cardHeight?: string | undefined;
  cardSpacing?: string | undefined;
  showBorder?: boolean | undefined;
  gap?: number | undefined;
  container?: IStyleType | undefined;
  dblClickActionConfiguration?: IConfigurableActionConfiguration | undefined;
  onRowDeleteSuccessAction?: IConfigurableActionConfiguration | undefined;
  collapsible?: boolean | undefined;
  collapseByDefault?: boolean | undefined;
  groupStyle?: string | undefined;
  inlineEditMode?: InlineEditMode | undefined;
  inlineSaveMode?: InlineSaveMode | undefined;
  noDataText?: string | undefined;
  noDataSecondaryText?: string | undefined;
  noDataIcon?: string | undefined;
  onNewListItemInitialize?: string | undefined;
}

interface IDataListActions {
  onSelectRow?: ((index: number, row: ITableRowData) => void) | undefined;
  onClearSelectedRow?: (() => void) | undefined;
  onMultiSelectRows: (rows: RowSelection<ITableRowData>[] | RowSelection<ITableRowData>) => void;

  onSelectedIdsChanged?: ((selectedRowIds: string[]) => void) | undefined;
  onDblClick?: ((data: ITableRowData, index?: number) => void) | undefined;

  /** Called when fetch data or refresh is complete is complete */
  onFetchDataSuccess?: (() => void) | undefined;
  onRowsChanged?: ((rows: object[]) => void) | undefined;

  changeSelectedIds: ((selectedIds: string[]) => void);

  deleteAction?: ((rowIndex: number, data: ITableRowData) => Promise<void>) | undefined;
  updateAction?: ((rowIndex: number, data: ITableRowData) => Promise<ITableRowData>) | undefined;
  createAction?: ((data: ITableRowData) => Promise<ITableRowData>) | undefined;

  onListItemClick?: ((index: number, item: ITableRowData) => void) | undefined;
  onListItemHover?: ((index: number, item: ITableRowData) => void) | undefined;
  onListItemSelect?: ((index: number, item: ITableRowData) => void) | undefined;
  onSelectionChange?: (selectedItems: ITableRowData[], selectedIndices: number[]) => void;
}

export interface GrouppedRow {
  index: number;
  row: ITableRowData;
};
export type RowOrGroup = GrouppedRow | RowsGroup;
export interface RowsGroup {
  value: unknown;
  index: number;
  $childs: RowOrGroup[];
}
export interface GroupLevelInfo {
  propertyName: string;
  index: number;
  currentGroup?: RowsGroup | undefined;
  propertyPath: string[];
}
export type GroupLevels = GroupLevelInfo[];
