import React, { FC, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'antd';
import { DataList } from '@/components/dataList';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import classNames from 'classnames';
import { IDataListWithDataSourceProps } from './model';
import { useConfigurableAction, useConfigurableActionDispatcher, useForm } from '@/providers';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from '@/providers/dataTable/repository/backendRepository';
import { useStyles } from '@/components/dataList/styles/styles';
import { executeScript, useAvailableConstantsData } from '@/providers/form/utils';
import { useDeepCompareMemo } from '@/hooks';
import { YesNoInherit } from '@/interfaces';
import { EmptyState } from '@/components';

export const NotConfiguredWarning: FC = () => {
  return <Alert className="sha-designer-warning" message="Data list is not configured properly" type="warning" />;
};

export type OnSaveHandler = (data: object) => Promise<object>;
export type OnSaveSuccessHandler = (data: object) => void;

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
    canDeleteInline,
    readOnly,
    noDataText = "No Data",
    noDataSecondaryText = "No data is available for this list",
    noDataIcon,
    allStyles,
    showEditIcons,
    onRowDeleteSuccessAction,
    orientation = 'vertical',
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
  const { styles } = useStyles();
  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSource;
  const appContext = useAvailableConstantsData();
  const { formMode } = useForm();
  const isDesignMode = formMode === 'designer';
  const { executeAction } = useConfigurableActionDispatcher();

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

  const data = useDeepCompareMemo(() => {
    return isDesignMode
      ? orientation === 'vertical'
        ? [{}]
        : [{}, {}, {}, {}]
      : tableData;
  }, [isDesignMode, tableData, orientation]);

  const performOnRowDeleteSuccessAction = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowDeleteSuccessAction)
      return () => {
        /* nop*/
      };
    return (data) => {
      const evaluationContext = { ...appContext, data };
      try {
        executeAction({
          actionConfiguration: onRowDeleteSuccessAction,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing item delete success action:', error);
      }
    };
  }, [onRowDeleteSuccessAction, appContext.contexts.lastUpdate, executeAction]);


  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onListItemSave) return (data) => Promise.resolve(data);

    return (data) => {
      return executeScript(onListItemSave, { ...appContext, data });
    };
  }, [onListItemSave, appContext.contexts.lastUpdate]);

  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onListItemSaveSuccessAction)
      return () => {
        // nop
      };

    return (data) => {
      const evaluationContext = { ...appContext, data };
      // execute the action
      try {
        executeAction({
          actionConfiguration: onListItemSaveSuccessAction,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing item save success action:', error);
      }
    };
  }, [onListItemSaveSuccessAction]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData).then((preparedData: object | undefined) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      // use preparedData ?? rowData to handle the case when onRowSave returns undefined
      return repository.performUpdate(rowIndex, preparedData ?? rowData, options).then((response) => {
        setRowData(rowIndex, preparedData ?? rowData);
        performOnRowSaveSuccess(preparedData ?? rowData);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData).then((preparedData: object | undefined) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      // use preparedData ?? rowData to handle the case when onRowSave returns undefined
      return repository.performCreate(0, preparedData ?? rowData, options).then(() => {
        dataSource.refreshTable();
        performOnRowSaveSuccess(preparedData ?? rowData);
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
      if (props.onRowDeleteSuccessAction) {
        performOnRowDeleteSuccessAction(rowData);
      }
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
        return !readOnly;
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

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;

  if (groupingColumns?.length > 0 && orientation === "wrap") {
    return <EmptyState noDataText='Configuration Error' noDataSecondaryText='Wrap Orientation is not supported when Grouping is enabled.' />;
  }

  
  return (
    <ConfigurableFormItem
      model={{ ...props, hideLabel: true }}
      className={classNames(
        styles.shaDatalistComponent,
        { horizontal: props?.orientation === 'horizontal' && formMode !== 'designer' }
      )}
      wrapperCol={{ md: 24 }}
    >

      <DataList
        {...props}
         onRowDeleteSuccessAction={props.onRowDeleteSuccessAction}
        style={allStyles.fullStyle as string}
        createFormId={props.createFormId ?? props.formId}
        createFormType={props.createFormType ?? props.formType}
        canAddInline={canAction(canAddInline)}
        canEditInline={canAction(canEditInline)}
        canDeleteInline={canAction(canDeleteInline)}
        noDataIcon={noDataIcon}
        noDataSecondaryText={noDataSecondaryText}
        noDataText={noDataText}
        entityType={modelType}
        onSelectRow={onSelectRow}
        onMultiSelectRows={setMultiSelectedRow}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={data}
        showEditIcons={showEditIcons}
        grouping={grouping}
        groupingMetadata={groupingColumns?.map(item => item.metadata) ?? []}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
        createAction={creater}
        updateAction={updater}
        deleteAction={deleter}
        actionRef={dataListRef}
        modalWidth={width ?? '60%'}
      />
    </ConfigurableFormItem>
  );
};

export default DataListControl;