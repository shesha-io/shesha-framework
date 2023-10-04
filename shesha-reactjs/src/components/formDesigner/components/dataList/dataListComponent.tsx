import React, { FC, useCallback, useMemo } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "../../../../interfaces";
import { Alert } from 'antd';
import { useDataTableStore, useForm } from '../../../../providers';
import { DataList } from '../../../dataList';
import { IDataListComponentProps } from '../../../dataList/models';
import { useDataSources } from '../../../../providers/dataSourcesProvider';
import ConfigurableFormItem from '../formItem';
import classNames from 'classnames';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';
import { DataListSettingsForm } from './dataListSettings';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
    type: 'datalist',
    name: 'DataList',
    icon: <UnorderedListOutlined />,
    factory: (model: IDataListComponentProps) => {
      if (model.hidden) return null;
      
      return <DataListWrapper {...model} />;
    },
    migrator: m => m
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
        })
      .add<IDataListComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      ,
      settingsFormFactory: (props) => (<DataListSettingsForm {...props}/>),
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


  if (!dataSource)
    return <NotConfiguredWarning />;
  
  const {
    tableData,
    isFetchingTableData,
    selectedIds,
    changeSelectedIds,
    getRepository,
    modelType
  } = dataSource;

  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSource;

  const repository = getRepository();

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
    }
  }, [setSelectedRow]);

  const data = useMemo(() => {
    return isDesignMode 
      ? props.orientation === 'vertical'
        ? [{}] 
        : [{}, {}, {}, {}]
      : tableData; 
  }, [isDesignMode, tableData, props.orientation]);

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
  