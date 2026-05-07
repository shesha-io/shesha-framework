import React from 'react';
import { CellProps, Renderer } from 'react-table';
import { IShaFormInstance, ITableColumn } from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import {
  isActionColumn,
  isCrudOperationsColumn,
  isDataColumn,
  isFormColumn,
  isRendererColumn,
  ITableRowData,
} from '@/providers/dataTable/interfaces';
import ActionCell from './actionCell';
import CrudOperationsCell from './crudOperationsCell';
import DataCell from './dataCell';
import FormCell from './formCell/formCell';
import { wrapDisplayName } from '@/utils/react';
import { RendererCell } from './rendererCell';
import { isFormFullName } from '../../..';
import { IFormCellProps } from './interfaces';

export const getCellRenderer = <D extends ITableRowData = ITableRowData, V = unknown>(
  column: ITableColumn,
  propertyMeta?: IPropertyMetadata,
  shaForm?: IShaFormInstance,
): Renderer<CellProps<D, V>> | undefined => {
  if (isDataColumn(column)) {
    // TODO: move to the column settings and use pre-=processor that adds a metadata to the column settings
    const baseProps = { columnConfig: column, propertyMeta };
    const renderer: Renderer<CellProps<D, V>> = (cellProps: CellProps<D, V>) => <DataCell<D, V> {...cellProps} {...baseProps} />;
    return wrapDisplayName<CellProps<D, V>>(renderer, "DataCell");
  }

  if (isActionColumn(column)) {
    const baseProps = { columnConfig: column };
    const renderer: Renderer<CellProps<D, V>> = (cellProps: CellProps<D, V>) => <ActionCell<D, V> {...cellProps} {...baseProps} />;
    return wrapDisplayName<CellProps<D, V>>(renderer, "ActionCell");
  }

  if (isCrudOperationsColumn(column)) {
    return wrapDisplayName(() => <CrudOperationsCell />, "CrudOperationsCell");
  }

  if (isFormColumn(column)) {
    const formId = shaForm?.formId;
    const baseProps: Pick<IFormCellProps<D, V>, 'columnConfig' | 'parentFormId' | 'parentFormName'> = {
      columnConfig: column,
      parentFormId: shaForm?.form?.id,
      parentFormName: isFormFullName(formId) ? `${formId.module}/${formId.name}` : "",
    };
    const renderer: Renderer<CellProps<D, V>> = (cellProps: CellProps<D, V>) => <FormCell<D, V> {...cellProps} {...baseProps} />;
    return wrapDisplayName<CellProps<D, V>>(renderer, "formCell");
  }

  if (isRendererColumn(column)) {
    const baseProps = { columnConfig: column };
    const renderer: Renderer<CellProps<D, V>> = (cellProps: CellProps<D, V>) => <RendererCell<D, V> {...cellProps} {...baseProps} />;
    return wrapDisplayName<CellProps<D, V>>(renderer, "RendererCell");
  }

  return undefined;
};
