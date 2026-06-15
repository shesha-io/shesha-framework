import React, { ReactNode, useRef, useCallback, useEffect } from 'react';
import { Cell } from 'react-table';
import { useStyles } from './styles/styles';
import { isStyledColumn } from '../dataTable/interfaces';
import classNames from 'classnames';
import { getColumnAnchored } from '@/utils/datatable';
import { getAnchoredCellStyleAccessor } from '../dataTable/utils';
import { useActualContextExecutionExecutor } from '@/hooks';
import { isDefined } from '@/utils/nullables';
import { ITableRowData } from '@/providers/dataTable/interfaces';

export interface IRowCellProps<TData extends ITableRowData = ITableRowData, TValue = unknown> {
  cell: Cell<TData, TValue>;
  row: Cell<TData, TValue>[];
  rowIndex?: number;
  preContent?: ReactNode;
  cellHeight?: number;
  getCellRef?: (cellRef: React.RefObject<HTMLDivElement | null> | undefined, isContentOverflowing: boolean | undefined) => void;
  showExpandedView?: boolean;
}

export const RowCell = <TData extends ITableRowData = ITableRowData>({ cell, preContent, row, rowIndex, cellHeight, getCellRef, showExpandedView }: IRowCellProps<TData>): ReactNode => {
  const { styles } = useStyles();
  const { key, style, ...restProps } = cell.getCellProps((props, { cell }) => [
    props,
    {
      style: {
        justifyContent: cell.column.align === 'right' ? 'flex-end' : 'flex-start',
        alignItems: 'center',
        display: 'flex',
      },
    },
  ]);
  const cellRef = useRef<HTMLDivElement>(null);
  const cellParentRef = useRef<HTMLDivElement>(null);

  let cellStyle = useActualContextExecutionExecutor(
    (context) => {
      return isStyledColumn(cell.column)
        ? cell.column.cellStyleAccessor(context)
        : undefined;
    },
    { row: cell.row.original, value: cell.value },
  );

  const anchored = getColumnAnchored(cell.column.anchored);

  const isFixed = anchored.isFixed;

  const anchoredCellStyle = isFixed && isDefined(rowIndex) ? getAnchoredCellStyleAccessor(row, cell, rowIndex) : undefined;

  if (isFixed && !cellStyle?.backgroundColor) {
    cellStyle = { ...cellStyle, background: anchoredCellStyle?.backgroundColor };
  }

  const findOverflowElement = (root: HTMLElement | null): HTMLElement | null => {
    if (!root) return null;
    if (
      root.childNodes.length === 1 &&
      root.childNodes[0]?.nodeType === Node.TEXT_NODE
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
    if (!cellRef.current || !overflowEl) return;
    if (!showExpandedView) {
      overflowEl.classList.remove("ellipsis");
      overflowEl.style.textOverflow = "initial";
      overflowEl.style.setProperty('display', 'flex', 'important');
      overflowEl.style.cursor = 'auto';
      return;
    }
    if (showExpandedView && (cell.column as unknown as { columnType: string }).columnType === 'data') {
      if (checkOverflow()) {
        const width = cellRef.current.getBoundingClientRect().width;
        overflowEl.style.maxWidth = width + 'px';
        overflowEl.style.setProperty('overflow', 'hidden', 'important');
        overflowEl.style.setProperty('text-overflow', 'ellipsis', 'important');
        overflowEl.style.setProperty('white-space', 'nowrap', 'important');
        overflowEl.style.setProperty('max-width', width + 'px', 'important');
        overflowEl.style.setProperty('display', 'inline-block', 'important');
        overflowEl.style.cursor = 'pointer';
      } else {
        overflowEl.classList.remove("ellipsis");
      }
    }
  }, [cell.column, checkOverflow, showExpandedView]);

  const hasStyles = (style && Object.keys(style).length > 0) || (cellStyle && Object.keys(cellStyle).length > 0);
  const mergedStyle = hasStyles
    ? {
      ...anchoredCellStyle,
      ...style,
      ...cellStyle,
      height: cellHeight || '100%',
      cursor: 'auto',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
    }
    : undefined;

  return (
    <div
      key={key}
      ref={cellParentRef}
      {...restProps}
      style={mergedStyle}
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
          if (isDefined(getCellRef)) {
            if (showExpandedView)
              getCellRef(cellRef, checkOverflow());
            else
              getCellRef(undefined, false);
          }
        }}
      >
        {cell.render('Cell')}
      </div>

    </div>
  );
};
