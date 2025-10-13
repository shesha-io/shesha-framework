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
  ITableFormColumn,
} from '@/providers/dataTable/interfaces';
import ActionCell from './actionCell';
import CrudOperationsCell from './crudOperationsCell';
import DataCell from './dataCell';
import FormCell from './formCell/formCell';
import { wrapDisplayName } from '@/utils/react';
import { RendererCell } from './rendererCell';

export const getCellRenderer = <D extends object = object, V = any>(
  column: ITableColumn,
  propertyMeta?: IPropertyMetadata,
  shaForm?: IShaFormInstance,
): Renderer<CellProps<D, V>> | undefined => {
  if (isDataColumn(column)) {
    // TODO: move to the column settings and use pre-=processor that adds a metadata to the column settings
    const baseProps = { columnConfig: column, propertyMeta };
    return wrapDisplayName((cellProps: CellProps<D, V>) => <DataCell<D, V> {...cellProps} {...baseProps} />, "DataCell");
  }
  if (isActionColumn(column)) {
    const baseProps = { columnConfig: column };
    return wrapDisplayName((cellProps: CellProps<D, V>) => <ActionCell<D, V> {...cellProps} {...baseProps} />, "ActionCell");
  }

  if (isCrudOperationsColumn(column)) {
    return wrapDisplayName(() => <CrudOperationsCell />, "CrudOperationsCell");
  }

  if (isFormColumn(column)) {
    const baseProps = { columnConfig: column as ITableFormColumn, parentFormId: shaForm?.form?.id, parentFormName: `${(shaForm as any)?.formId?.module}/${(shaForm as any)?.formId?.name}` };
    return wrapDisplayName((cellProps: CellProps<D, V>) => <FormCell<D, V> {...cellProps} {...baseProps} />, "formCell");
  }

  if (isRendererColumn(column)) {
    const baseProps = { columnConfig: column };
    return wrapDisplayName((cellProps: CellProps<D, V>) => <RendererCell<D, V> {...cellProps} {...baseProps} />, "RendererCell");
  }

  return null;
};
