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
  onMouseOver?: (props?: boolean) => void;
  onMouseLeave?: any;
  getCellRef?: (props?: any) => void;
  isContentOverflowing?: boolean;
}

export const RowCell: FC<IRowCellProps> = ({ cell, preContent, row, rowIndex, cellHeight, onMouseOver, onMouseLeave, getCellRef }) => {
  const { styles } = useStyles();
  const { key, style, ...restProps } = cell.getCellProps(cellProps);
  const cellRef = useRef(null);
  const bingRef = useRef(null);
  const [bingRefWidth, setBingRefWidth] = useState<number>();
  const [isContentOverflowing, setIsOverflowing] = useState<boolean>(false);

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
      const isContentOverflowing = 
        cellRef.current.scrollWidth > cellRef.current.clientWidth;
      setIsOverflowing(isContentOverflowing);
      return isContentOverflowing;
    }
    return false;
  }, []);

  useEffect(()=>{
    const bingRefRect = bingRef.current.getBoundingClientRect();
    setBingRefWidth(bingRefRect.width);
  },[bingRef])

  return (
    <div
      key={key}
      ref={bingRef}
      {...restProps}
      style={style || cellStyle ? { ...anchoredCellStyle, ...style, ...cellStyle, height: cellHeight, cursor: isContentOverflowing ? 'pointer' : 'auto', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' } : undefined}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
      })}
    >
      {preContent}

      <div
        ref={cellRef}
        onMouseOver={() => {onMouseOver(checkOverflow()); getCellRef(cellRef)}}
        onMouseLeave={() => {onMouseLeave();}}
        onClick={(event) => {event.preventDefault()}}
        onMouseUp={(event) => {event.preventDefault()}}
        onSelect={(event) => event.stopPropagation()}
        style={{ maxWidth: bingRefWidth + "px", overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}
      >
        {cell.render('Cell')}

      </div>
    </div>
  );
};
