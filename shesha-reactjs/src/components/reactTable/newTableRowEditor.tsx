import { FormIdentifier, IFlatComponentsStructure } from '@/interfaces';
import { CrudProvider } from '@/providers/crudContext';
import React, { FC } from 'react';

import { ColumnInstance, HeaderGroup } from 'react-table';
import { NewRowCell } from './newRowCell';

export interface INewRowEditorProps {
  columns: ColumnInstance[];
  headerGroups: HeaderGroup<any>[];
  creater: (data: any) => Promise<any>;
  onInitData?: () => Promise<object>;
  components?: IFlatComponentsStructure;
  parentFormId?: FormIdentifier;
}

export const NewTableRowEditor: FC<INewRowEditorProps> = (props) => {
  const { creater, columns, headerGroups, onInitData, components, parentFormId } = props;

  const { key, ...headerGroupProps } = headerGroups.length > 0 ? headerGroups[0].getHeaderGroupProps() : { key: '' };

  return (
    <div className="tbody" style={{ overflowX: 'unset' }}>
      <CrudProvider
        isNewObject={true}
        mode="create"
        data={onInitData}
        creater={creater}
        allowEdit={false}
        updater={null}
        allowDelete={false}
        deleter={null}
        allowChangeMode={false}
        editorComponents={components}
      >
        <div className="tr tr-body sha-new-row" {...headerGroupProps}>
          {columns
            .filter((c) => c.isVisible)
            .map((column, index) => {
              return <NewRowCell key={index} column={column} rowIndex={index} row={columns} parentFormId={parentFormId} />;
            })}
        </div>
      </CrudProvider>
    </div>
  );
};

export default NewTableRowEditor;
