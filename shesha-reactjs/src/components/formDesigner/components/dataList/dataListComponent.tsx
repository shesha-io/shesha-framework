import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "../../../../interfaces";
import { Alert } from 'antd';
import { useDataTableSelection, useDataTableStore, useForm } from '../../../../providers';
import { DataList } from '../../../dataList';
import { IDataListComponentProps } from '../../../dataList/models';
import DataListSettings from './dataListSettings';
import { useDataSources } from '../../../../providers/dataSourcesProvider';
import ConfigurableFormItem from '../formItem';
import classNames from 'classnames';

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
        })
      .add<IDataListComponentProps>(1, prev => {
        return {
          ...prev,
          orientation: 'vertical',
          listItemWidth: 1
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
    tableSorting,
    changeSelectedRow,
    changeSelectedIds,
    getRepository,
    onSort,
    modelType
  } = dataSource;

  /* ToDo: AS - Need to review and move this feature to DataTableContext/DataSource */
  const sort = {id: props.defaultSortBy, desc: props.defaultSortOrder === 'desc' };
  const [sortBy, setSortBy] = useState(sort);
  useEffect(() => {
    if (!(tableSorting?.length > 0) || sort.id !== sortBy.id || sort.desc !== sortBy.desc)
      setTimeout(() => onSort([sort]), 100);
    setSortBy(sort);
  }, [props.defaultSortBy, props.defaultSortOrder]);
  /* ---------------------------------------------------*/

  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSelection;

  const repository = getRepository();

  const onSelectRow = useCallback((index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
      if (changeSelectedRow) 
        changeSelectedRow(row);
    }
  }, [changeSelectedRow]);

  const data = useMemo(() => {
    return isDesignMode 
      ? props.orientation === 'vertical'
        ? [{}] 
        : [{}, {}, {}, {}]
      : tableData; 
  }, [isDesignMode, tableData, props.orientation]);

  if (isDesignMode 
    && (
      !repository 
      || !props.formId && props.formSelectionMode === "name"
      || !props.formType && props.formSelectionMode === "view"
      || !props.formIdExpression && props.formSelectionMode === "expression"
      )) return <NotConfiguredWarning />;

  //console.log(`DataListWrapper render, ${data?.length} records`);

  return (
    <ConfigurableFormItem
      model={{ ...props }}
      className={classNames(
        'sha-list-component',
        { horizontal: props?.orientation === 'horizontal' && formMode !== 'designer' } //
      )}
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
    >
      <DataList
        {...props}
        entityType={modelType}
        onSelectRow={onSelectRow}
        onMultiSelectRows={setMultiSelectedRow}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={data}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
      />
    </ConfigurableFormItem>
  );
};

export default DataListComponent;
  