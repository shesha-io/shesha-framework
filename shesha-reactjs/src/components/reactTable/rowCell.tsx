import React, { FC, ReactNode } from 'react';
import { Cell, CellPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';
import classNames from 'classnames';
import { calculatePositionShift, calculateTotalColumnsOnFixed, getColumnAnchored } from '@/utils';
import { IAnchoredColumnProps } from '@/providers/dataTable/interfaces';

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

  const anchored = getColumnAnchored((cell?.column as any)?.anchored);
  const index = row.indexOf(cell);
  const isFixed = anchored?.isFixed;

  let leftColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };
  let rightColumn: IAnchoredColumnProps = { shift: 0, shadowPosition: 0 };

  if (anchored?.isFixed && index > 0) {
    // use first row cell values to calculate the left shift

    if (anchored?.direction === 'right') {
      const totalColumns =row?.length;
      rightColumn.shadowPosition =totalColumns- calculateTotalColumnsOnFixed(row, 'right');

      rightColumn.shift = calculatePositionShift(row, index,totalColumns - 1)?.reduce(
        (acc, curr) => (acc as number) + curr,
        0
      );
    } else if (anchored?.direction === 'left') {
      leftColumn.shadowPosition = calculateTotalColumnsOnFixed(row, 'left') - 1;

      leftColumn.shift = calculatePositionShift(row, 0, index)?.reduce((acc, curr) => (acc as number) + curr, 0);
    }
  }

  const background = rowIndex % 2 === 0 ? '#f0f0f0' : 'white';

  const direction = anchored?.direction === 'left' ? 'left' : 'right';

  const shiftedBy = leftColumn.shift || rightColumn.shift;

  const fixedStyled: React.CSSProperties = {
    [direction]: anchored?.direction && shiftedBy,
    backgroundColor: background,
  };

  const numOfFixed = leftColumn.shadowPosition || rightColumn.shadowPosition;

  const hasShadow = numOfFixed === index && anchored?.isFixed;

  return (
    <div
      key={key}
      {...restProps}
      style={style || cellStyle ? { ...style, ...cellStyle, ...fixedStyled } : undefined}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
        [anchored?.direction === 'right' ? styles.boxShadowRight : styles.boxShadowLeft]: hasShadow,
      })}
    >
      {preContent}

      {cell.render('Cell')}
    </div>
  );
};
