import React, { FC, ReactNode } from 'react';
import { Cell, CellPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';
import classNames from 'classnames';
import { getColumnAnchored } from '@/utils';
import { getAnchoredCellStyleAccessor } from '../dataTable/utils';
import { useActualContextExecutionExecutor } from '@/hooks';

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
  row?: Cell<any, any, any>[];
  rowIndex?: number;
  preContent?: ReactNode;
}

export const RowCell: FC<IRowCellProps> = ({ cell, preContent, row, rowIndex }) => {
  const { styles } = useStyles();
  const { key, style, ...restProps } = cell.getCellProps(cellProps);

  let cellStyle: React.CSSProperties = useActualContextExecutionExecutor(
    (context) => {
      return isStyledColumn(cell.column)
        ? cell.column.cellStyleAccessor(context)
        : undefined;
    },
    { row: cell.row.original, value: cell.value }
  );

  const anchored = getColumnAnchored((cell?.column as any)?.anchored);

  const isFixed = anchored?.isFixed;
  
  const anchoredCellStyle = isFixed ? getAnchoredCellStyleAccessor(row, cell, rowIndex) : undefined;

  if (isFixed && !cellStyle?.backgroundColor) {
    cellStyle = { ...cellStyle, background: anchoredCellStyle?.backgroundColor };
  }

  return (
    <div
      key={key}
      {...restProps}
      style={style || cellStyle ? { ...anchoredCellStyle, ...style, ...cellStyle } : undefined}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
      })}
    >
      {preContent}

      {cell.render('Cell')}
    </div>
  );
};
