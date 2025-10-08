import { ReactNode } from 'react';
import { IRendererCellProps } from './interfaces';
import { isRendererColumn } from '@/providers/dataTable/interfaces';

export const RendererCell = <D extends object = object, V = number>(props: IRendererCellProps<D, V>): ReactNode => {
  const { columnConfig } = props;
  if (!isRendererColumn(columnConfig))
    return undefined;

  return columnConfig.renderCell(props.row.original);
};
