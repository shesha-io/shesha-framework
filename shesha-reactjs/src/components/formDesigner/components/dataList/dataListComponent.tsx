import React, { FC, useCallback, useMemo } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "../../../../interfaces";
import { Alert } from 'antd';
import { useDataTableSelection, useDataTableStore, useForm } from '../../../../providers';
import { DataList } from '../../../dataList';
import { IDataListComponentProps } from '../../../dataList/models';
import DataListSettings from './dataListSettings';
import { useDataSources } from '../../../../providers/dataSourcesProvider';
import { IBackendRepository } from 'providers/dataTable/repository/backendRepository';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
    type: 'datalist',
    name: 'DataList',
    icon: <UnorderedListOutlined />,
    factory: (model: IDataListComponentProps) => {

      //console.log(`DataListComponent render`);

      return <DataListWrapper {...model} />;
    },
    migrator:  m => m
      .add<IDataListComponentProps>(0, prev => {
        return {
          ...prev,
          formSelectionMode: 'name',
          selectionMode: 'none',
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

  const ds = useDataSources();

  const dts = useDataTableStore(false);

  const dataSource = props.dataSource
    ? ds.getDataSource(props.dataSource)?.dataSource
    : dts;

  const dSel = useDataTableSelection(false);

  const dataSelection = props.dataSource
    ? ds.getDataSource(props.dataSource)?.dataSelection
    : dSel;

  if (!dataSource || !dataSelection)
    return <NotConfiguredWarning />;
  
  const {
    tableData,
    isFetchingTableData,
    selectedIds,
    changeSelectedRow,
    changeSelectedIds,
    getRepository,
  } = dataSource;

  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSelection;

  const repository = getRepository();
  // todo: find a better way to pass entity type, it should be generic
  const entityType = (repository as IBackendRepository)?.entityType;

  if (isDesignMode 
    && (
      !repository 
      || !props.formId && props.formSelectionMode === "name"
      || !props.formType && props.formSelectionMode === "view"
      || !props.formIdExpression && props.formSelectionMode === "expression"
      )) return <NotConfiguredWarning />;

  const onSelectRow = useCallback((index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
      if (changeSelectedRow) 
        changeSelectedRow(row);
    }
  }, [changeSelectedRow]);

  const data = useMemo(() => {
    return isDesignMode ? [{}] : tableData; 
  }, [isDesignMode, tableData]);

  //console.log(`DataListWrapper render, ${data?.length} records`);

  return (
      <DataList
        {...props}
        entityType={entityType}
        onSelectRow={onSelectRow}
        onMultiSelectRows={setMultiSelectedRow}
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
  