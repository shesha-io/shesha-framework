import React, { FC, ReactNode } from 'react';
import { Cell, CellPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';
import classNames from 'classnames';

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

  const cellStyle = isStyledColumn(cell.column)
    ? cell.column.cellStyleAccessor({ row: cell.row.original, value: cell.value })
    : undefined;

  const isFixed = (cell?.column as any)?.isFixed;

  const index = row.indexOf(cell);

  const numOfFixed = row.filter(({ column: { isFixed } }: any) => isFixed).length - 1;

  let leftShift = 0;

  if (isFixed && index > 0) {
    leftShift = (
      row.slice(0, index).map(({ column: { width, minWidth } }) => {
        const isLessThanMinWidth = (width as number) < minWidth;
        return isLessThanMinWidth ? minWidth : width;
      }) as Array<number>
    ).reduce((acc, curr) => (acc as number) + curr, 0);
  }

  const background = rowIndex % 2 === 0 ? '#f0f0f0' : 'white';

  const fixedStyled: React.CSSProperties = {
    left: leftShift,
    backgroundColor: background,
  };

  return (
    <div
      key={key}
      {...restProps}
      style={style || cellStyle ? { ...style, ...cellStyle, ...fixedStyled } : undefined}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
        [styles.boxShadow]: numOfFixed == index,
      })}
    >
      {preContent}

      {cell.render('Cell')}
    </div>
  );
};
