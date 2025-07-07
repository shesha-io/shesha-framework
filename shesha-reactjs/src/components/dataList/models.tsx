import { MutableRefObject } from 'react';
import { FormIdentifier, IStyleType } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { ISelectionProps } from '@/providers/dataTable/contexts';
import { ISortingItem } from '@/providers/dataTable/interfaces';

export type DataListSelectionMode = 'none' | 'single' | 'multiple';
export type FormSelectionMode = 'name' | 'view' | 'expression';
export type Orientation = 'vertical' | 'horizontal' | 'wrap';
export type ListItemWidth = number | 'custom';
export type InlineEditMode = 'one-by-one' | 'all-at-once';
export type InlineSaveMode = 'auto' | 'manual';

export type NewItemInitializer = () => Promise<object>;

export interface IDataListProps extends IDataListBaseProps, IDataListActions {
  records?: any[];
  groupingMetadata?: IPropertyMetadata[];
  selectedRow?: ISelectionProps;
  selectedRows?: { [key in string]: string }[];

  isFetchingTableData?: boolean;

  selectedIds?: string[];

  canDeleteInline?: boolean;
  canEditInline?: boolean;
  canAddInline?: boolean;

  allowChangeEditMode?: boolean;

  actionRef?: MutableRefObject<any>;

  modalWidth?: string;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;
}

export interface IDataListBaseProps extends IStyleType {
  id: string;
  
  dataSource?: string;

  formSelectionMode?: FormSelectionMode;
  formId?: FormIdentifier;
  formType?: string;
  formIdExpression?: string;

  createFormId?: FormIdentifier;
  createFormType?: string;

  selectionMode?: DataListSelectionMode;

  grouping?: ISortingItem[];

  entityType?: string;

  orientation?: Orientation;
  listItemWidth?: ListItemWidth;
  customListItemWidth?: number;
  cardMinWidth?: string;
  cardMaxWidth?: string;
  cardHeight?: string;
  cardSpacing?: string;
  showBorder?: boolean;
  gap?: number;
  container?: IStyleType;

  dblClickActionConfiguration?: IConfigurableActionConfiguration;
  onRowDeleteSuccessAction?: IConfigurableActionConfiguration;
  collapsible?: boolean;
  collapseByDefault?: boolean;
  groupStyle?: string;

  inlineEditMode?: InlineEditMode;
  inlineSaveMode?: InlineSaveMode;
  noDataText?: string;
  noDataSecondaryText?: string;
  noDataIcon?: string;

  onNewListItemInitialize?: string;
}

interface IDataListActions {
  onSelectRow?: (index: number, row: any) => void;
  onMultiSelectRows?: (rows: any[]) => void;
  onSelectedIdsChanged?: (selectedRowIds: string[]) => void;
  onDblClick?: (data: any, index?: number) => void;

  /** Called when fetch data or refresh is complete is complete */
  onFetchDataSuccess?: () => void;
  onRowsChanged?: (rows: object[]) => void;

  changeSelectedIds?: (selectedIds: string[]) => void;

  deleteAction?: (rowIndex: number, data: any) => Promise<any>;
  updateAction?: (rowIndex: number, data: any) => Promise<any>;
  createAction?: (data: any) => Promise<any>;
}

export interface Row {
  index: number;
  row: any;
};
export type RowOrGroup = Row | RowsGroup;
export interface RowsGroup {
  value: any;
  index: number;
  $childs: RowOrGroup[];
}
export interface GroupLevelInfo {
  propertyName: string;
  index: number;
  currentGroup?: RowsGroup;
  propertyPath: string[];
}
export type GroupLevels = GroupLevelInfo[];