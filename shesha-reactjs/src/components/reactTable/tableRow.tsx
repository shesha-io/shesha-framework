import { MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC, useRef } from 'react';
import { Row } from 'react-table';
import { RowCell } from './rowCell';
import { CrudProvider } from '@/providers/crudContext';
import { InlineSaveMode } from './interfaces';
import { IFlatComponentsStructure } from '@/providers/form/models';
import { useDataTableStore } from '@/providers/index';
import { useStyles } from './styles/styles';

export type RowEditMode = 'read' | 'edit';

export interface ISortableRowProps {
  prepareRow: (row: Row<any>) => void;
  onClick: (row: Row<any>) => void;
  onDoubleClick: (row: Row<any>, index: number) => void;
  onRowClick?: () => void;
  onRowHover?: () => void;
  row: Row<any>;
  index: number;
  selectedRowIndex?: number;
  allowEdit: boolean;
  updater?: (data: any) => Promise<any>;
  allowDelete: boolean;
  deleter?: () => Promise<any>;
  editMode?: RowEditMode;
  allowChangeEditMode: boolean;
  inlineSaveMode?: InlineSaveMode;
  inlineEditorComponents?: IFlatComponentsStructure;
  inlineDisplayComponents?: IFlatComponentsStructure;
  onMouseOver?: (cellRef?: any, isContentOverflowing?: boolean) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  showExpandedView?: boolean;
  striped?: boolean;
}

interface RowDragHandleProps {
  row: Row<any>;
}
export const RowDragHandle: FC<RowDragHandleProps> = () => {
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

export const TableRow: FC<ISortableRowProps> = (props) => {
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
    showExpandedView,
    striped,
  } = props;

  const { styles } = useStyles();
  const { dragState, setDragState } = useDataTableStore();
  const tableRef = useRef(null);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDoubleClickRef = useRef(false);

  const handleRowClick = (): void => {
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

  const rowId = row.original.id ?? row.id;

  return (
    <CrudProvider
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
          { [styles.trSelected]: selectedRowIndex === row?.index || row?.isSelected },
        )}
        key={rowId}
      >
        {row.cells.map((cell, cellIndex) => {
          return (
            <RowCell
              showExpandedView={showExpandedView}
              cell={cell}
              getCellRef={(cellRef, isContentOverflowing) => {
                onMouseOver(cellRef, isContentOverflowing);
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

export const SortableRow: FC<ISortableRowProps> = (props) => {
  return <TableRow {...props} />;
};
