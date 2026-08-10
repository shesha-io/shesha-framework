import { FormIdentifier, IFlatComponentsStructure } from '@/interfaces';
import { CrudProvider } from '@/providers/crudContext';
import React, { ReactNode } from 'react';
import { ColumnInstance, HeaderGroup } from 'react-table';
import { NewRowCell } from './newRowCell';
import { ITableRowData } from '@/providers/dataTable/interfaces';
import { RowDataInitializer } from './interfaces';
import { isNonEmptyArray } from '@/utils/array';

export interface INewRowEditorProps<TData extends ITableRowData = ITableRowData> {
  columns: ColumnInstance<TData>[];
  headerGroups: HeaderGroup<TData>[];
  creater: (data: TData) => Promise<TData>;
  onInitData: RowDataInitializer<TData>;
  components?: IFlatComponentsStructure | undefined;
  parentFormId?: FormIdentifier | undefined;
}

export const NewTableRowEditor = <TData extends ITableRowData = ITableRowData>(props: INewRowEditorProps<TData>): ReactNode => {
  const { creater, columns, headerGroups, onInitData, components, parentFormId } = props;

  const { key, ...headerGroupProps } = isNonEmptyArray(headerGroups)
    ? headerGroups[0].getHeaderGroupProps()
    : { key: '' };

  return (
    <div className="tbody" style={{ overflowX: 'unset' }}>
      <CrudProvider
        isNewObject={true}
        mode="create"
        data={onInitData}
        creater={creater}
        allowEdit={false}
        updater={undefined}
        allowDelete={false}
        deleter={undefined}
        allowChangeMode={false}
        editorComponents={components}
      >
        <div className="tr tr-body sha-new-row" {...headerGroupProps}>
          {columns
            .filter((c) => c.isVisible)
            .map((column, index) => {
              return <NewRowCell<TData> key={index} column={column} rowIndex={index} row={columns} parentFormId={parentFormId} />;
            })}
        </div>
      </CrudProvider>
    </div>
  );
};

export default NewTableRowEditor;
