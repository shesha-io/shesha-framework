import { MutableRefObject, ReactNode } from 'react';
import { CellProps, Column, Row } from 'react-table';
import { IAnyObject } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IPropertyMetadata, ProperyDataType } from '@/interfaces/metadata';
import { DataTableFullInstance } from '@/providers/dataTable/contexts';
import { CellStyleFunc, IDataTableInstance, ITableColumn } from '@/providers/dataTable/interfaces';
import { InlineEditMode, InlineSaveMode, ITableRowDragProps, NewRowCapturePosition } from '../reactTable/interfaces';

export interface ITableActionColumns {
  icon?: ReactNode;
  onClick?: (id: string, context: IDataTableInstance, row: IAnyObject) => string | void | Promise<any>;
}

export interface ITableCustomTypeEditor {
  key: string;
  property: string;
  render: (data: IColumnEditFieldProps) => ReactNode;
}

export type DataTableColumn<D extends object = {}> = Column<D> & {
  resizable?: boolean;
  originalConfig?: ITableColumn;
  metadata?: IPropertyMetadata;
  cellStyleAccessor?: CellStyleFunc;
};

export type IStyledColumn<D extends object = {}> = DataTableColumn<D> & {
  cellStyleAccessor: CellStyleFunc;
};

export const isStyledColumn = <D extends object = {}>(column: DataTableColumn<D>): column is IStyledColumn<D> => {
  const typed = column as IStyledColumn<D>;
  return typed && typed.cellStyleAccessor && typeof typed.cellStyleAccessor === 'function';
};

export interface IColumnEditFieldProps {
  id: string;
  name: string;
  caption?: string;
  referenceListName?: string;
  referenceListModule?: string;
  entityReferenceTypeShortAlias?: string;
  dataType: ProperyDataType;
  value?: any;
  onChange: (key: string, value: any) => void;
}

export type YesNoInheritJs = 'yes' | 'no' | 'inherit' | 'js';

export interface IShaDataTableInlineEditableProps {
  canDeleteInline?: YesNoInheritJs;
  canDeleteInlineExpression?: string; // todo: replace with new dynamic JS properties
  customDeleteUrl?: string;
  canEditInline?: YesNoInheritJs;
  canEditInlineExpression?: string; // todo: replace with new dynamic JS properties
  inlineEditMode?: InlineEditMode;
  inlineSaveMode?: InlineSaveMode;
  customUpdateUrl?: string;
  canAddInline?: YesNoInheritJs;
  canAddInlineExpression?: string; // todo: replace with new dynamic JS properties
  newRowCapturePosition?: NewRowCapturePosition;
  newRowInsertPosition?: NewRowCapturePosition;
  customCreateUrl?: string;
  onNewRowInitialize?: string;
  onRowSave?: string;
  onRowSaveSuccessAction?: IConfigurableActionConfiguration;
}

export interface IShaDataTableProps extends ITableRowDragProps, IShaDataTableInlineEditableProps {
  useMultiselect?: boolean;
  freezeHeaders?: boolean;
  disableCustomFilters?: boolean;
  /**
   * @deprecated pass this on an `IndexTableProvider` level
   */

  header?: string;
  selectedRowIndex?: number;
  onSelectRow?: (index: number, row: any) => void;
  onSelectedIdsChanged?: (selectedRowIds: string[]) => void;
  onDblClick?: (data: any, index?: number) => void;
  onMultiRowSelect?: (rows: Array<Row> | Row) => void;
  customTypeEditors?: ITableCustomTypeEditor[];
  onRowsChanged?: (rows: object[]) => void;
  tableRef?: MutableRefObject<Partial<DataTableFullInstance> | null>;
  /**
   * A callback for when the file export has succeeded
   */
  onExportSuccess?: () => void;

  /**
   * Called when fetch data or refresh is complete is complete
   */
  onFetchDataSuccess?: () => void;
  /**
   * A callback for when the file export has failed
   */
  onExportError?: () => void;
}

export interface ITableCellRenderingArgs<TValue = any> {
  value?: TValue;
  onChange?: (value?: TValue) => void;
}

export interface ITableCustomTypesRender<D extends object, V = any> {
  key: string;
  dataFormat?: string;
  //render: (cellProps: ITableCellRenderingArgs, router: any) => JSX.Element;
  render: (cellProps: CellProps<D, V>, router: any) => JSX.Element;
}

export type OnSaveHandler = (data: object, formData: object, globalState: object) => Promise<object>;
export type OnSaveSuccessHandler = (
  data: object,
  formData: object,
  globalState: object,
  setGlobalState: Function,
  setFormData: Function
) => void;
