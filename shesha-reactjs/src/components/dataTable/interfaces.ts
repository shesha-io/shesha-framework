import { InlineEditMode, InlineSaveMode, ITableRowDragProps, NewRowCapturePosition } from '../reactTable/interfaces';
import { MutableRefObject, ReactNode } from 'react';
import { IDataTableInstance, ITableColumn } from '../../providers/dataTable/interfaces';
import { DataTableFullInstance } from '../../providers/dataTable/contexts';
import { IAnyObject } from '../../interfaces';
import { Column, Row, CellProps } from 'react-table';
import { ProperyDataType } from 'interfaces/metadata';
import { IConfigurableActionConfiguration } from 'interfaces/configurableAction';

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

export type YesNoInherit = 'yes' | 'no' | 'inherit' | 'js';

export interface IShaDataTableInlineEditableProps {
  canDeleteInline?: YesNoInherit;
  canDeleteInlineExpression?: string; // todo: replace with new dynamic JS properties
  customDeleteUrl?: string;
  canEditInline?: YesNoInherit;
  canEditInlineExpression?: string; // todo: replace with new dynamic JS properties
  inlineEditMode?: InlineEditMode;
  inlineSaveMode?: InlineSaveMode;
  customUpdateUrl?: string;
  canAddInline?: YesNoInherit;
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
export type OnSaveSuccessHandler = (data: object, formData: object, globalState: object) => void;