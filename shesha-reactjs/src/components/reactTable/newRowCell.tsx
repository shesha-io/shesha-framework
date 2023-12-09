import CrudOperationsCell from '@/components/dataTable/cell/crudOperationsCell';
import { CreateDataCell } from '@/components/dataTable/cell/dataCell';
import { DataTableColumn } from '@/components/dataTable/interfaces';
import { useMetadata } from '@/providers';
import React, { FC } from 'react';
import { ColumnInstance, HeaderPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { toCamelCase } from '@/utils/string';

const getStyles = (props: Partial<TableHeaderProps | TableCellProps>, align = 'left') => [
  props,
  {
    style: {
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: 'flex-start',
      display: 'flex',
    },
  },
];

const cellProps: HeaderPropGetter<object> = (props, { column }) => getStyles(props, column.align);

export interface INewRowCellProps {
  column: ColumnInstance;
}

export const NewRowCell: FC<INewRowCellProps> = ({ column }) => {
  const columnConfig = (column as DataTableColumn)?.originalConfig;

  const metadata = useMetadata(false)?.metadata;
  const propertyMeta = metadata?.properties?.find(({ path }) => toCamelCase(path) === column.id);

  return (
    <div className="td" {...column.getHeaderProps(cellProps)}>
      { columnConfig && columnConfig.columnType === 'data' && (<CreateDataCell columnConfig={columnConfig} propertyMeta={propertyMeta}/>) }
      { columnConfig && columnConfig.columnType === 'crud-operations' && (<CrudOperationsCell columnConfig={columnConfig} />) }
    </div>
  );
};