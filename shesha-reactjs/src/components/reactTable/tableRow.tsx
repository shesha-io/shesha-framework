import { MoreOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { FC } from 'react';
import { Row } from 'react-table';
import { RowCell } from './rowCell';
import { CrudProvider } from 'providers/crudContext';
import { InlineSaveMode } from './interfaces';
import { IFlatComponentsStructure } from 'providers/form/models';

export type RowEditMode = 'read' | 'edit';

export interface ISortableRowProps {
  prepareRow: (row: Row<any>) => void;
  onClick: (row: Row<any>) => void;
  onDoubleClick: (row: Row<any>, index: number) => void;
  row: Row<any>;
  index: number;
  selectedRowIndex?: number;
  allowSort?: boolean;
  allowEdit: boolean;
  updater?: (data: any) => Promise<any>;
  allowDelete: boolean;
  deleter?: () => Promise<any>;
  editMode?: RowEditMode;
  allowChangeEditMode: boolean;
  inlineSaveMode?: InlineSaveMode;
  inlineEditorComponents?: IFlatComponentsStructure;
  inlineDisplayComponents?: IFlatComponentsStructure;
}

/*
export const SortableRow = SortableElement<ISortableRowProps>(props => <TableRow {...props} />);

export const RowDragHandle = SortableHandle(() => (
  <div className="row-handle" style={{ cursor: 'grab' }}>
    <MoreOutlined />
  </div>
));
*/
export const SortableRow: FC<ISortableRowProps> = (props) => (<TableRow {...props} />);

export const RowDragHandle = () => (
  <div className="row-handle" style={{ cursor: 'grab' }}>
    <MoreOutlined />
  </div>
);

export const TableRow: FC<ISortableRowProps> = props => {
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
  } = props;

  const handleRowClick = () => onClick(row);

  const handleRowDoubleClick = () => onDoubleClick(row, index);

  prepareRow(row);

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
        onClick={handleRowClick}
        onDoubleClick={handleRowDoubleClick}
        {...row.getRowProps()}
        className={classNames(
          'tr tr-body',
          { 'tr-odd': index % 2 === 0 },
          { 'sha-tr-selected': selectedRowIndex === row?.index }
        )}
      >
        {row.cells.map((cell, index) => {
          return <RowCell cell={cell} key={index} />;
        })}
      </div>
    </CrudProvider>
  );
};
