import React from 'react';
import { CellProps, Renderer } from 'react-table';
import { IShaFormInstance, ITableColumn } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import {
  ITableActionColumn,
  ITableCrudOperationsColumn,
  ITableDataColumn,
  ITableFormColumn,
} from '@/providers/dataTable/interfaces';
import ActionCell from './actionCell';
import CrudOperationsCell from './crudOperationsCell';
import DataCell from './dataCell';
import FormCell from './formCell/formCell';
import { wrapDisplayName } from '@/utils/react';

export const getCellRenderer = <D extends object = {}, V = any>(
  column: ITableColumn,
  propertyMeta?: IPropertyMetadata,
  shaForm?: IShaFormInstance
): Renderer<CellProps<D, V>> | undefined => {
  switch (column.columnType) {
    case 'data': {
      // TODO: move to the column settings and use pre-=processor that adds a metadata to the column settings
      const baseProps = { columnConfig: column as ITableDataColumn, propertyMeta };
      return wrapDisplayName((cellProps: CellProps<D, V>) => <DataCell<D, V> {...cellProps} {...baseProps} />, "DataCell");
    }
    case 'action': {
      const baseProps = { columnConfig: column as ITableActionColumn };
      return wrapDisplayName((cellProps: CellProps<D, V>) => <ActionCell<D, V> {...cellProps} {...baseProps} />, "ActionCell");
    }
    case 'crud-operations': {
      const baseProps = { columnConfig: column as ITableCrudOperationsColumn };
      return wrapDisplayName(() => <CrudOperationsCell {...baseProps} />, "CrudOperationsCell");
    }
    case 'calculated': {
      return null;
    }
    case 'form': {
      const baseProps = { columnConfig: column as ITableFormColumn, parentFormId: shaForm?.form?.id, parentFormName: `${(shaForm as any)?.formId?.module}/${(shaForm as any)?.formId?.name}` };
      return wrapDisplayName((cellProps: CellProps<D, V>) => <FormCell<D, V> {...cellProps} {...baseProps} />, "formCell");
    }
    default: {
      console.error(`Unexpected column type '${column.columnType}'`, column);
      return null;
    }
  }
  return null;
};
