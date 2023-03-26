import React, { FC } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "../../../../../interfaces";
import { Alert } from 'antd';
import { useDataTableSelection, useDataTableStore, useForm } from '../../../../../providers';
import { DataList } from './dataList';
import { IDataListComponentProps } from './models';
import DataListSettings from './dataListSettings';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
    type: 'datalist',
    name: 'DataList',
    icon: <UnorderedListOutlined />,
    factory: (model: IDataListComponentProps) => {
      return <DataListWrapper {...model} />;
    },
    migrator:  m => m
      .add<IDataListComponentProps>(0, prev => {
        return {
          ...prev,
          formSelectionMode: 'name',
          items: [],
        };
        }),
    settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
      return (
        <DataListSettings
          readOnly={readOnly}
          model={model}
          onSave={onSave}
          onCancel={onCancel}
          onValuesChange={onValuesChange}
        />
      );
    },
};

const NotConfiguredWarning: FC = () => {
    return <Alert className="sha-designer-warning" message="Data list is not configured properly" type="warning" />;
};
  
export const DataListWrapper: FC<IDataListComponentProps> = (props) => {
  const { formMode } = useForm();
  //const { globalState } = useGlobalState();

  const isDesignMode = formMode === 'designer';

  const {
    entityType,
    getDataPath,
    sourceType,

    tableData,
    isFetchingTableData,

    // Select
    selectedIds,
    changeSelectedRow,
    changeSelectedIds
  } = useDataTableStore();

  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = useDataTableSelection();

  /**
   * This expression will be executed when the row has been dropped
   * @param expression - the expression to be executed
   * @param row - the row data that has just been dropped
   * @param oldIndex - the old index of the row
   * @param newIndex - the new index of the row
   * @returns - a function to execute
   */
  /*const getExpressionExecutor = (expression: string, row: any, oldIndex: number, newIndex: number) => {
    if (!expression) 
      return null;

    // tslint:disable-next-line:function-constructor
    return new Function('row, routes, oldIndex, newIndex, globalState, http, message, data, refreshTable', expression)(
      row,
      tableData,
      oldIndex,
      newIndex,
      globalState,
      axiosHttp(backendUrl),
      message,
      formData,
      refreshTable
    );
  };*/

  if (isDesignMode && (!(entityType || getDataPath || sourceType == "Form") || !(props.formId || props.formType))) return <NotConfiguredWarning />;

  const onSelectRow = (index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
      if (changeSelectedRow) 
        changeSelectedRow(row);
    }
  };

  const onMultiRowSelect = (rows: any[]) => {
    setMultiSelectedRow(rows);
  }

  return (
      <DataList
        {...props}
        onSelectRow={onSelectRow}
        onMultiSelectRows={onMultiRowSelect}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={isDesignMode ? [{}] : tableData}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
      />
  );
};

export default DataListComponent;
  