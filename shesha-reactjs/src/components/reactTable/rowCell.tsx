import React, { FC, ReactNode } from 'react';
import { Cell, CellPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { useStyles } from './styles/styles';

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
  const { key, ...restProps } = cell.getCellProps(cellProps);
  return (
    <div 
      key={key} 
      {...restProps}
      className={styles.td}
    >
      {preContent}
      {cell.render('Cell')}
    </div>
  );
};
