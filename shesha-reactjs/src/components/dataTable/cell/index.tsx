import React from 'react';
import { CellProps, Renderer } from 'react-table';
import { ITableColumn } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import {
  ITableActionColumn,
  ITableCrudOperationsColumn,
  ITableDataColumn,
} from '@/providers/dataTable/interfaces';
import ActionCell from './actionCell';
import CrudOperationsCell from './crudOperationsCell';
import DataCell from './dataCell';

export const getCellRenderer = <D extends object = {}, V = any>(
  column: ITableColumn,
  propertyMeta?: IPropertyMetadata
): Renderer<CellProps<D, V>> | undefined => {
  switch (column.columnType) {
    case 'data': {
      // todo: move to the column settings and use pre-=processor that adds a metadata to the column settings
      const baseProps = { columnConfig: column as ITableDataColumn, propertyMeta };
      return (cellProps: CellProps<D, V>) => <DataCell<D, V> {...cellProps} {...baseProps} />;
    }
    case 'action': {
      const baseProps = { columnConfig: column as ITableActionColumn };
      return (cellProps: CellProps<D, V>) => <ActionCell<D, V> {...cellProps} {...baseProps} />;
    }
    case 'crud-operations': {
      const baseProps = { columnConfig: column as ITableCrudOperationsColumn };
      return () => <CrudOperationsCell {...baseProps} />;
    }
    case 'calculated': {
      return null;
    }
    default: {
      console.error(`Unexpected column type '${column.columnType}'`, column);
      return null;
    }
  }
  return null;
};
