import React, { FC, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'antd';
import { DataList } from '../../../dataList';
import ConfigurableFormItem from '../formItem';
import classNames from 'classnames';
import moment from 'moment';
import { IDataListWithDataSourceProps } from './model';
import { useApplicationContext, useConfigurableAction, useConfigurableActionDispatcher, YesNoInherit } from '@/index';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from '@/providers/dataTable/repository/backendRepository';

export const NotConfiguredWarning: FC = () => {
  return <Alert className="sha-designer-warning" message="Data list is not configured properly" type="warning" />;
};

export type OnSaveHandler = (data: object, formData: object, contexts: object, globalState: object) => Promise<object>;
export type OnSaveSuccessHandler = (
  data: object,
  formData: object,
  contexts: object,
  globalState: object,
  setGlobalState: Function,
  setFormData: Function
) => void;

const DataListControl: FC<IDataListWithDataSourceProps> = (props) => {
  const { 
    dataSourceInstance: dataSource,
    onListItemSave,
    onListItemSaveSuccessAction,
    customUpdateUrl,
    customCreateUrl,
    customDeleteUrl,
    canAddInline,
    canEditInline,
    canDeleteInline
  } = props;
  const {
    tableData,
    isFetchingTableData,
    selectedIds,
    changeSelectedIds,
    getRepository,
    modelType,
    grouping,
    groupingColumns,
    setRowData
  } = dataSource;
  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSource;

  const allData = useApplicationContext();
  const isDesignMode = allData.formMode === 'designer';

  const repository = getRepository();

  const onSelectRow = useCallback((index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
    }
  }, [setSelectedRow]);

  const dataListRef = useRef<any>({});

  useConfigurableAction(
    {
      name: 'Add new item (if allowed)',
      owner: props.componentName,
      ownerUid: props.id,
      hasArguments: false,
      executer: () => {
        if (dataListRef.current?.addNewItem)
          dataListRef.current.addNewItem();
        return Promise.resolve();
      },
    },
    []
  );

  const data = useMemo(() => {
    return isDesignMode
      ? props.orientation === 'vertical'
        ? [{}]
        : [{}, {}, {}, {}]
      : tableData;
  }, [isDesignMode, tableData, props.orientation]);

  // http, moment, setFormData
  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onListItemSave) return (data) => Promise.resolve(data);

    const executer = new Function('data, formData, contexts, globalState, http, moment', onListItemSave);
    return (data, formData, contexts, globalState) => {
      const preparedData = executer(data, formData, contexts, globalState, allData.http, allData.moment);
      return Promise.resolve(preparedData);
    };
  }, [onListItemSave]);

  const { executeAction } = useConfigurableActionDispatcher();
  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onListItemSaveSuccessAction)
      return () => {
        //nop
      };

    return (data, formData, contexts, globalState, setGlobalState, setFormData) => {
      const evaluationContext = {
        data,
        formData,
        contexts,
        globalState,
        setGlobalState,
        setFormData,
        http: allData.http,
        moment,
      };
      // execute the action
      executeAction({
        actionConfiguration: onListItemSaveSuccessAction,
        argumentsEvaluationContext: evaluationContext,
      });
    };
  }, [onListItemSaveSuccessAction]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, allData.data ?? {}, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then((response) => {
        setRowData(rowIndex, preparedData/*, response*/);
        performOnRowSaveSuccess(preparedData, allData.data ?? {}, allData.contexts ?? {}, allData.globalState, allData.setGlobalState, allData.setFormData);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, allData.data ?? {}, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      return repository.performCreate(0, preparedData, options).then(() => {
        dataSource.refreshTable();
        performOnRowSaveSuccess(preparedData, allData.data ?? {}, allData.contexts ?? {}, allData.globalState, allData.setGlobalState, allData.setFormData);
      });
    });
  };

  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      dataSource.refreshTable();
    });
  };

  const canAction = (val: YesNoInherit) => {
    switch (val) {
      case 'yes':
        return true;
      case 'no':
        return false;
      case 'inherit':
        return allData.formMode === 'edit';
    }
    return false;
  };

  if (isDesignMode
    && (
      !repository
      || !props.formId && props.formSelectionMode === "name"
      || !props.formType && props.formSelectionMode === "view"
      || !props.formIdExpression && props.formSelectionMode === "expression"
    )) return <NotConfiguredWarning />;

  return (
    <ConfigurableFormItem
      model={{ ...props }}
      className={classNames(
        'sha-datalist-component',
        { horizontal: props?.orientation === 'horizontal' && allData.formMode !== 'designer' } //
      )}
      labelCol={{ span: 0 }}
      wrapperCol={{ span: 24 }}
    >
      <DataList
        {...props}

        canAddInline={canAction(canAddInline)}
        canEditInline={canAction(canEditInline)}
        canDeleteInline={canAction(canDeleteInline)}

        entityType={modelType}
        onSelectRow={onSelectRow}
        onMultiSelectRows={setMultiSelectedRow}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={data}
        grouping={grouping}
        groupingMetadata={groupingColumns?.map(item => item.metadata) ?? []}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
        createAction={creater}
        updateAction={updater}
        deleteAction={deleter}

        actionRef={dataListRef}
      />
    </ConfigurableFormItem>
  );
};

export default DataListControl;