import React, { FC, ReactNode, useEffect, useRef, useState, useCallback } from 'react';
import { Cell, CellPropGetter, TableCellProps, TableHeaderProps } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';
import classNames from 'classnames';
import { getColumnAnchored } from '@/utils';
import { getAnchoredCellStyleAccessor } from '../dataTable/utils';

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
  cellHeight?: number;
  getCellRef?: (cellRef?: React.MutableRefObject<any>, isContentOverflowing?: boolean) => void;
  showExpandedView?: boolean;
}

export const RowCell: FC<IRowCellProps> = ({ cell, preContent, row, rowIndex, cellHeight, getCellRef, showExpandedView }) => {
  const { styles } = useStyles();
  const { key, style, ...restProps } = cell.getCellProps(cellProps);
  const cellRef = useRef(null);
  const cellParentRef = useRef(null);
  const [cellParentRefWidth, setcellParentRefWidth] = useState<number>();

  let cellStyle = isStyledColumn(cell.column)
    ? cell.column.cellStyleAccessor({ row: cell.row.original, value: cell.value })
    : undefined;

  const anchored = getColumnAnchored((cell?.column as any)?.anchored);

  const isFixed = anchored?.isFixed;

  const anchoredCellStyle = isFixed ? getAnchoredCellStyleAccessor(row, cell, rowIndex) : undefined;

  if (isFixed && !cellStyle?.backgroundColor) {
    cellStyle = { ...cellStyle, background: anchoredCellStyle?.backgroundColor };
  }

  const checkOverflow = useCallback(() => {
    if (cellRef.current) {
      return cellRef.current.scrollWidth > cellRef.current.clientWidth;
    }
    return false;
  }, []);

  useEffect(() => {
    const cellParentRefRect = cellParentRef.current.getBoundingClientRect();
    setcellParentRefWidth(cellParentRefRect.width);
  }, [cellParentRef]);

  return (
    <div
      key={key}
      ref={cellParentRef}
      {...restProps}
      style={style || cellStyle ? { ...anchoredCellStyle, ...style, ...cellStyle, height: cellHeight, cursor: 'auto', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' } : undefined}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
      })}
    >
      {preContent}
      <div
        ref={cellRef}
        className={showExpandedView && styles.shaCellParent}
        onMouseOver={() => {
          void (showExpandedView ? getCellRef(cellRef, checkOverflow()) : getCellRef(null, null));
        }}
        style={{ maxWidth: cellParentRefWidth + "px" }}>
        {cell.render('Cell')}

      </div>
    </div>
  );
};
