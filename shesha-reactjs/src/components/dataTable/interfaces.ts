import { Column, Row } from 'react-table';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { CellStyleFunc, IAnchoredDirection, ITableColumn, ITableRowData } from '@/providers/dataTable/interfaces';
import { InlineEditMode, InlineSaveMode, ITableRowDragProps, NewRowCapturePosition } from '../reactTable/interfaces';
import { isDefined } from '@/utils/nullables';

export type TableSelectionMode = 'none' | 'single' | 'multiple';

export type DataTableColumn<D extends object = object> = Column<D> & {
  resizable?: boolean;
  originalConfig?: ITableColumn;
  metadata?: IPropertyMetadata;
  anchored?: IAnchoredDirection;
  cellStyleAccessor?: CellStyleFunc;
  disableSortBy?: boolean | undefined; // TODO: replace and move to a correct type
  disableResizing?: boolean | undefined; // TODO: review and merge with resizable
};

export type IStyledColumn<D extends object = object> = DataTableColumn<D> & {
  cellStyleAccessor: CellStyleFunc;
};

export const isStyledColumn = <D extends object = object>(column: DataTableColumn<D>): column is IStyledColumn<D> => {
  return isDefined(column) && "cellStyleAccessor" in column && typeof column.cellStyleAccessor === 'function';
};

export type YesNoInheritJs = 'yes' | 'no' | 'inherit' | 'js';

export interface IShaDataTableInlineEditableProps {
  canDeleteInline?: YesNoInheritJs | undefined;
  canDeleteInlineExpression?: string | undefined; // TODO: replace with new dynamic JS properties
  customDeleteUrl?: string | undefined;
  canEditInline?: YesNoInheritJs | undefined;
  canEditInlineExpression?: string | undefined; // TODO: replace with new dynamic JS properties
  inlineEditMode?: InlineEditMode | undefined;
  inlineSaveMode?: InlineSaveMode | undefined;
  customUpdateUrl?: string | undefined;
  canAddInline?: YesNoInheritJs | undefined;
  canAddInlineExpression?: string | undefined; // TODO: replace with new dynamic JS properties
  newRowCapturePosition?: NewRowCapturePosition | undefined;
  newRowInsertPosition?: NewRowCapturePosition | undefined;
  customCreateUrl?: string | undefined;
  onNewRowInitialize?: string | undefined;
  onRowSave?: string | undefined;
  onRowSaveSuccessAction?: IConfigurableActionConfiguration | undefined;
  onDblClick?: IConfigurableActionConfiguration | ((rowData: unknown, index?: number) => void) | undefined;
  onRowDeleteSuccessAction?: IConfigurableActionConfiguration | undefined;

  onRowClick?: IConfigurableActionConfiguration | undefined;
  onRowDoubleClick?: IConfigurableActionConfiguration | undefined;
  onRowHover?: IConfigurableActionConfiguration | undefined;
  onRowSelect?: IConfigurableActionConfiguration | undefined;
  onSelectionChange?: IConfigurableActionConfiguration | undefined;
}

export interface IShaDataTableProps extends ITableRowDragProps, IShaDataTableInlineEditableProps {
  selectionMode?: TableSelectionMode | undefined;
  freezeHeaders?: boolean | undefined;
  disableCustomFilters?: boolean | undefined;
  columnsMismatch?: boolean | undefined;
  /**
   * @deprecated pass this on an `IndexTableProvider` level
   */

  header?: string | undefined;
  selectedRowIndex?: number | undefined;
  onSelectRow?: ((index: number, row: ITableRowData) => void) | undefined;
  onSelectedIdsChanged?: ((selectedRowIds: string[]) => void) | undefined;
  onMultiRowSelect?: ((rows: Array<Row<ITableRowData>> | Row<ITableRowData>) => void) | undefined;
  /**
   * Called when fetch data or refresh is complete is complete
   */
  onFetchDataSuccess?: (() => void) | undefined;
}

export interface ITableCellRenderingArgs<TValue = unknown> {
  value?: TValue;
  onChange?: (value?: TValue) => void;
}

export type OnSaveHandler = (data: ITableRowData) => Promise<ITableRowData | undefined>;
export type OnSaveSuccessHandler = (
  data: ITableRowData,
) => void;
