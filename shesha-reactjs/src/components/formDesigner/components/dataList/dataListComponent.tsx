import React, { FC, useMemo } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "../../../../interfaces";
import { Alert } from 'antd';
import { useDataTableSelection, useDataTableStore, useForm } from '../../../../providers';
import { DataList } from '../../../dataList';
import { IDataListComponentProps } from '../../../dataList/models';
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
  const isDesignMode = formMode === 'designer';

  const {
    entityType,
    getDataPath,
    sourceType,
    tableData,
    isFetchingTableData,
    selectedIds,
    changeSelectedRow,
    changeSelectedIds
  } = useDataTableStore();

  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = useDataTableSelection();

  if (isDesignMode && (!(entityType || getDataPath || sourceType === "Form") || !(props.formId || props.formType))) return <NotConfiguredWarning />;

  const onSelectRow = (index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
      if (changeSelectedRow) 
        changeSelectedRow(row);
    }
  };

  const onMultiRowSelect = (rows: any[]) => {
    setMultiSelectedRow(rows);
  };

  const data = useMemo(() => {
 return isDesignMode ? [{}] : tableData; 
}, [isDesignMode, tableData]);

  return (
      <DataList
        {...props}
        entityType={entityType}
        onSelectRow={onSelectRow}
        onMultiSelectRows={onMultiRowSelect}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={data}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
      />
  );
};

export default DataListComponent;
  