import { MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC, ReactNode, useRef } from 'react';
import { Row } from 'react-table';
import { RowCell } from './rowCell';
import { CrudProvider } from '@/providers/crudContext';
import { InlineSaveMode } from './interfaces';
import { IFlatComponentsStructure } from '@/providers/form/models';
import { useDataTableStore } from '@/providers/index';
import { useStyles } from './styles/styles';
import { ITableRowData } from '@/providers/dataTable/interfaces';

export type RowEditMode = 'read' | 'edit';

export interface ISortableRowProps<TData extends ITableRowData = ITableRowData> {
  prepareRow: (row: Row<TData>) => void;
  onClick: (row: Row<TData>) => void;
  onDoubleClick: (row: Row<TData>, index: number) => void;
  onRowClick?: (() => void) | undefined;
  onRowHover?: (() => void) | undefined;
  row: Row<TData>;
  index: number;
  selectedRowIndex?: number | undefined;
  allowEdit: boolean;
  updater?: ((data: TData) => Promise<TData>) | undefined;
  allowDelete: boolean;
  deleter?: (() => Promise<void>) | undefined;
  editMode?: RowEditMode | undefined;
  allowChangeEditMode: boolean;
  inlineSaveMode?: InlineSaveMode | undefined;
  inlineEditorComponents?: IFlatComponentsStructure | undefined;
  inlineDisplayComponents?: IFlatComponentsStructure | undefined;
  onMouseOver?: (cellRef: React.RefObject<HTMLDivElement | null> | undefined, isContentOverflowing?: boolean) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  showExpandedView?: boolean | undefined;
  striped?: boolean | undefined;
}

export const RowDragHandle: FC = () => {
  const { setDragState } = useDataTableStore();
  const handleMouseDown = (): void => {
    setDragState('started');
  };
  const handleMouseUp = (): void => {
    setDragState(null);
  };
  return (
    <div className="row-handle" style={{ cursor: 'grab' }} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
      <MoreOutlined />
    </div>
  );
};

export const TableRow = <TData extends ITableRowData = ITableRowData>(props: ISortableRowProps<TData>): ReactNode => {
  const {
    row,
    prepareRow,
    onClick,
    onDoubleClick,
    onRowClick,
    onRowHover,
    index,
    selectedRowIndex,
    updater,
    deleter,
    allowEdit,
    allowDelete,
    editMode,
    allowChangeEditMode,
    inlineSaveMode,
    inlineEditorComponents,
    inlineDisplayComponents,
    onMouseOver,
    showExpandedView = false,
    striped,
  } = props;

  const { styles } = useStyles();
  const { dragState, setDragState } = useDataTableStore();
  const tableRef = useRef(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDoubleClickRef = useRef(false);

  const handleRowClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;

    const isInPortal = target.closest('.ant-select-dropdown') ||
      target.closest('.ant-picker-dropdown') ||
      target.closest('.ant-dropdown') ||
      target.closest('.ant-drawer') ||
      target.closest('.ant-tooltip');

    const isEditableElement = target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'BUTTON' ||
      target.closest('.ant-select') ||
      target.closest('.ant-picker') ||
      target.closest('.ant-input-number') ||
      target.closest('.ant-checkbox') ||
      target.closest('.ant-radio') ||
      target.closest('.ant-switch') ||
      target.closest('.ant-slider') ||
      target.closest('.ant-rate') ||
      target.closest('.ant-upload') ||
      target.closest('.sha-form-cell') ||
      target.closest('[contenteditable="true"]');


    if (isEditableElement || isInPortal || editMode === 'edit') {
      return;
    }

    // Reset double-click flag for a fresh click sequence
    isDoubleClickRef.current = false;

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Use a timeout to detect if this is part of a double-click
    clickTimeoutRef.current = setTimeout(() => {
      // Only execute click logic if it wasn't part of a double-click
      if (!isDoubleClickRef.current) {
        onClick(row);
        if (onRowClick) {
          onRowClick();
        }
      }
      isDoubleClickRef.current = false;
      clickTimeoutRef.current = null;
    }, 250); // 250ms timeout to detect double-click
  };

  const handleRowDoubleClick = (): void => {
    // Mark that a double-click occurred
    isDoubleClickRef.current = true;

    // Clear any pending click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Execute double-click logic
    onDoubleClick(row, index);
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const handleRowMouseEnter = (): void => {
    if (dragState === 'finished')
      setDragState(null);
    if (onRowHover) {
      onRowHover();
    }
  };

  prepareRow(row);

  const rowId = row.original.id;

  return (
    <CrudProvider<TData>
      isNewObject={false}
      data={row.original}
      allowEdit={allowEdit}
      updater={updater}
      allowDelete={allowDelete}
      deleter={deleter}
      mode={editMode === 'edit' ? 'update' : 'read'}
      allowChangeMode={allowChangeEditMode}
      autoSave={inlineSaveMode === 'auto'}
      editorComponents={inlineEditorComponents}
      displayComponents={inlineDisplayComponents}
    >
      <div
        onMouseEnter={handleRowMouseEnter}
        ref={tableRef}
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
        {...row.getRowProps()}
        className={classNames(
          styles.tr,
          styles.trBody,
          { [styles.trOdd]: striped && index % 2 === 0 },
          { [styles.trSelected]: selectedRowIndex === index || row.isSelected },
        )}
        key={rowId}
      >
        {row.cells.map((cell, cellIndex) => {
          return (
            <RowCell
              showExpandedView={showExpandedView}
              cell={cell}
              getCellRef={(cellRef, isContentOverflowing) => {
                onMouseOver?.(cellRef, isContentOverflowing);
              }}
              key={cellIndex}
              row={row.cells}
              rowIndex={index}
            />
          );
        })}
      </div>
    </CrudProvider>
  );
};

export const SortableRow = <TData extends ITableRowData = ITableRowData>(props: ISortableRowProps<TData>): ReactNode => {
  return <TableRow<TData> {...props} />;
};
