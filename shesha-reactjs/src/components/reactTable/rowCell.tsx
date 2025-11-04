import React, { FC, ReactNode, useRef, useCallback, useEffect } from 'react';
import { Cell, CellPropGetter } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';
import classNames from 'classnames';
import { getColumnAnchored } from '@/utils/datatable';
import { getAnchoredCellStyleAccessor } from '../dataTable/utils';
import { useActualContextExecutionExecutor } from '@/hooks';

const cellProps: CellPropGetter<object> = (props, { cell }) => [
  props,
  {
    style: {
      justifyContent: cell.column.align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: 'center',
      display: 'flex',
    },
  },
];

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

  let cellStyle = useActualContextExecutionExecutor(
    (context) => {
      return isStyledColumn(cell.column)
        ? cell.column.cellStyleAccessor(context)
        : undefined;
    },
    { row: cell.row.original, value: cell.value },
  );

  const anchored = getColumnAnchored((cell?.column as any)?.anchored);

  const isFixed = anchored?.isFixed;

  const anchoredCellStyle = isFixed ? getAnchoredCellStyleAccessor(row, cell, rowIndex) : undefined;

  if (isFixed && !cellStyle?.backgroundColor) {
    cellStyle = { ...cellStyle, background: anchoredCellStyle?.backgroundColor };
  }

  const findOverflowElement = (root: HTMLElement | null): HTMLElement | null => {
    if (!root) return null;
    if (
      root.childNodes.length === 1 &&
      root.childNodes[0].nodeType === Node.TEXT_NODE
    ) {
      return root;
    }

    const richText = root.querySelector<HTMLElement>('.acss-o0dn82');
    if (richText) return richText;

    let node: HTMLElement = root;
    while (
      node.children &&
      node.children.length === 1 &&
      node.children[0] instanceof HTMLElement
    ) {
      node = node.children[0] as HTMLElement;
    }
    return node || root;
  };


  const checkOverflow = useCallback((): boolean => {
    if (!cellRef.current) return false;
    const overflowEl = findOverflowElement(cellRef.current);
    if (!overflowEl) return false;
    return overflowEl.scrollWidth > overflowEl.clientWidth;
  }, []);

  // antd's css-in-js classes force a css flex property, which prevents ellipsis from working.
  // this overrides the flex and puts it back when we no longer need inline-block
  useEffect(() => {
    const overflowEl = findOverflowElement(cellRef.current);
    if (!cellRef.current) return;
    if (!showExpandedView) {
      overflowEl.classList.remove("ellipsis");
      overflowEl.style.textOverflow = "initial";
      overflowEl.style.setProperty('display', 'flex', 'important');
      overflowEl.style.cursor = 'auto';
      return;
    }
    if (overflowEl && showExpandedView && (cell.column as unknown as { columnType: string }).columnType === 'data') {
      if (checkOverflow()) {
        overflowEl.style.maxWidth = cellRef.current.width + 'px';
        overflowEl.style.setProperty('overflow', 'hidden', 'important');
        overflowEl.style.setProperty('text-overflow', 'ellipsis', 'important');
        overflowEl.style.setProperty('white-space', 'nowrap', 'important');
        overflowEl.style.setProperty('max-width', cellRef.current.width + 'px', 'important');
        overflowEl.style.setProperty('display', 'inline-block', 'important');
        overflowEl.style.cursor = 'pointer';
      } else {
        overflowEl.classList.remove("ellipsis");
      }
    }
  }, [checkOverflow, showExpandedView]);

  return (
    <div
      key={key}
      ref={cellParentRef}
      {...restProps}
      style={style ?? cellStyle ? { ...anchoredCellStyle, ...style, ...cellStyle, height: cellHeight, cursor: 'auto', textOverflow: 'ellipsis', whiteSpace: 'nowrap', alignItems: 'flex-start' } : undefined}
      className={classNames(styles.td, {
        [styles.fixedColumn]: isFixed,
        [styles.relativeColumn]: !isFixed,
      })}
    >
      {preContent}
      <div
        ref={cellRef}
        className={showExpandedView && (cell.column as unknown as { columnType: string }).columnType === 'data' && (typeof cell.value === 'string' || typeof cell.value === 'object') ? styles.shaCellParent : styles.shaCellParentFW}
        onMouseOver={() => {
          void (showExpandedView ? getCellRef(cellRef, checkOverflow()) : getCellRef(null, null));
        }}
      >
        {cell.render('Cell')}
      </div>

    </div>
  );
};
