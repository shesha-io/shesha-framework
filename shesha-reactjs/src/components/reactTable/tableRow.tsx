import { MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC, Fragment, useEffect, useRef, useState } from 'react';
import { Row } from 'react-table';
import { RowCell } from './rowCell';
import { CrudProvider } from '@/providers/crudContext';
import { InlineSaveMode } from './interfaces';
import { IFlatComponentsStructure } from '@/providers/form/models';
import { useDataTableStore, useForm } from '@/providers/index';
import { useStyles } from './styles/styles';

export type RowEditMode = 'read' | 'edit';

export interface ISortableRowProps {
  prepareRow: (row: Row<any>) => void;
  onClick: (row: Row<any>) => void;
  onDoubleClick: (row: Row<any>, index: number) => void;
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
  showOverflow?: boolean;
}

interface RowDragHandleProps {
  row: Row<any>;
}
export const RowDragHandle: FC<RowDragHandleProps> = () => {
  const { setDragState } = useDataTableStore();
  const handleMouseDown = () => {
    setDragState('started');
  };
  const handleMouseUp = () => {
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
    showOverflow,
  } = props;

  const { styles } = useStyles();
  const { dragState, setDragState } = useDataTableStore();
  const tableRef = useRef(null);
  const [popupShowing, setPopupShowing] = useState<Boolean>(false);
  const [popupPosition, setPopupPosition] = useState<{x: string | number, y: string | number}>({x: 0, y: 0});
  const [innerCellRef, setInnerCellRef] = useState(null);
  const popUpRef = useRef(null); 
  const { formMode } = useForm(); 

  const handleRowClick = () => {
    onClick(row);
  };

  const handleRowDoubleClick = () => {
    onDoubleClick(row, index);
  };

  prepareRow(row);

  const rowId = row.original.id ?? row.id;

  const handleCellRef = (ref) => {
    setInnerCellRef(ref);
    const clientRect = ref.getBoundingClientRect();
    setPopupPosition({x: clientRect.x, y: clientRect.y});
  }

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

    {/*Handle alternate backgroundColor here*/}
      <div
        onMouseEnter={() => {
          if (dragState === 'finished')
            setDragState(null);
        }}
        ref={tableRef}
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
        {...row.getRowProps()}
        className={classNames(
          styles.tr,
          styles.trBody,
          { [styles.trOdd]: index % 2 === 0 },
          { [styles.trSelected]: selectedRowIndex === row?.index },
        )}
        key={rowId}
      >
        {row.cells.map((cell, cellIndex) => {
          return(
          <Fragment>
            <RowCell onMouseOver={(props)=> {setPopupShowing(props)}} getCellRef={(ref) => {handleCellRef(ref.current)}}  onMouseLeave={()=>{setPopupShowing(false)}} cell={cell} key={cellIndex} row={row.cells} rowIndex={index}/>
              {popupShowing && Boolean(cell.value) && formMode !== 'designer' && showOverflow === true && (innerCellRef.innerText === cell.value?._displayName || innerCellRef.innerText === cell?.value) &&
              <div ref={popUpRef} style={{ transition: 'all .3s', left: parseInt(popupPosition.x as string) - 60 + "px"}}
              className={styles.rowCell}
              onMouseEnter={()=>{setPopupShowing(true)}} onMouseLeave={()=>{setPopupShowing(false)}}>{cell?.value?._displayName ?? cell?.value}
              </div>}
          </Fragment>
          )
        })}
      </div>
    </CrudProvider>
  );
};

export const SortableRow: FC<ISortableRowProps> = (props) => {
  return <TableRow {...props} />;
};