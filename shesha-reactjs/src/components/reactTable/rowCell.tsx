import React, { FC, ReactNode } from 'react';
import { Cell, CellPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';

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

const cellProps: CellPropGetter<object> = (props, { cell }) => getStyles(props, cell.column.align);

export interface IRowCellProps {
  cell: Cell<any, any>;
  preContent?: ReactNode;
}

export const RowCell: FC<IRowCellProps> = ({ cell, preContent }) => {
  const { styles } = useStyles();
  const { key, style, ...restProps } = cell.getCellProps(cellProps);

  const cellStyle = isStyledColumn(cell.column)
    ? cell.column.cellStyleAccessor({ row: cell.row.original, value: cell.value })
    : undefined;
  
  return (
    <div 
      key={key}
      {...restProps}
      style={style || cellStyle ? { ...style, ...cellStyle } : undefined}
      className={styles.td}
    >
      {preContent}
      {cell.render('Cell')}
    </div>
  );
};
