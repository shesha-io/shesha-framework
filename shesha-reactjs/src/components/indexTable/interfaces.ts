import { ITableRowDragProps } from './../reactTable/interfaces';
import { IndexColumnDataType } from './../../providers/dataTable/interfaces';
import { MutableRefObject, ReactNode } from 'react';
import { IDataTableInstance } from '../../providers/dataTable/interfaces';
import { DataTableFullInstance } from '../../providers/dataTable/contexts';
import { IAnyObject } from '../../interfaces';
import { Row } from 'react-table';

export interface ITableActionColumns {
  icon?: ReactNode;
  onClick?: (id: string, context: IDataTableInstance, row: IAnyObject) => string | void | Promise<any>;
}

export interface ITableCustomTypesRender {
  key: string;
  render: (data: any, router: any) => ReactNode;
}

export interface ITableCustomTypeEditor {
  key: string;
  property: string;
  render: (data: IColumnEditFieldProps) => ReactNode;
}

export interface IColumnEditFieldProps {
  id: string;
  name: string;
  caption?: string;
  referenceListName?: string;
  referenceListModule?: string;
  entityReferenceTypeShortAlias?: string;
  dataType: IndexColumnDataType;
  value?: any;
  onChange: (key: string, value: any) => void;
}

export interface IShaDataTableProps extends ITableRowDragProps {
  useMultiselect?: boolean;
  disableCustomFilters?: boolean;
  actionColumns?: ITableActionColumns[];
  /**
   * @deprecated pass this on an `IndexTableProvider` level
   */

  header?: string;
  selectedRowIndex?: number;
  onSelectRow?: (index: number, row: any) => void;
  onSelectedIdsChanged?: (selectedRowIds: string[]) => void;
  onDblClick?: (data: any, index?: number) => void;
  onMultiRowSelect?: (rows: Array<Row> | Row) => void;
  customTypeRenders?: ITableCustomTypesRender[];
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
