import React, { FC, useCallback, useMemo, useRef } from 'react';
import { Alert, App } from 'antd';
import { DataList } from '@/components/dataList';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import classNames from 'classnames';
import moment from 'moment';
import { IDataListWithDataSourceProps } from './model';
import { useConfigurableAction, useConfigurableActionDispatcher, useDataContextManager } from '@/providers';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from '@/providers/dataTable/repository/backendRepository';
import { useStyles } from '@/components/dataList/styles/styles';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useDeepCompareMemo } from '@/hooks';
import { YesNoInherit } from '@/interfaces';
import { EmptyState } from '@/components';
import { IFormApi } from '@/providers/form/formApi';
import FileSaver from 'file-saver';

export const NotConfiguredWarning: FC = () => {
  return <Alert className="sha-designer-warning" message="Data list is not configured properly" type="warning" />;
};

export type OnSaveHandler = (data: object, formData: object, contexts: object, globalState: object) => Promise<object>;
export type OnSaveSuccessHandler = (
  data: object,
  form: IFormApi,
  contexts: object,
  globalState: object,
  setGlobalState: Function
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
    canDeleteInline,
    showEditIcons,
    readOnly,
    noDataText = "No Data",
    noDataSecondaryText = "No data is available for this list",
    noDataIcon,
    onRowDeleteSuccessAction
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

  const allData = useAvailableConstantsData();
  const isDesignMode = allData.form?.formMode === 'designer';

  const appContext = App.useApp();
  const message = appContext?.message ?? null;
  if (!message && isDesignMode) {
    console.warn('Message API not available in current context during mode switch');
  }

  const dataContextManager = useDataContextManager(false);

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
      ? props.orientation === 'vertical'
        ? [{}]
        : [{}, {}, {}, {}]
      : tableData;
  }, [isDesignMode, tableData, props.orientation]);

  // http, moment, setFormData
  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onListItemSave) {
      // No custom handler - just pass through the data unchanged
      return (data) => {
        return Promise.resolve(data);
      };
    }

    const executer = new Function('data, contexts, fileSaver, form, globalState, http, message, moment, pageContext, selectedRow, setGlobalState', onListItemSave);

    return async (data, form, _, globalState) => {
      // Safely get contexts data - fallback to empty object if not available
      const contextData = dataContextManager?.getDataContextsData?.() || {};

      // Create fileSaver API with safe error handling
      const fileSaver = {
        saveAs: (data: object | string, filename?: string, _?: object) => {
          try {
            FileSaver.saveAs(new Blob([typeof data === 'string' ? data : JSON.stringify(data)]), filename || 'download.txt');
          } catch (error) {
            console.error('Error saving file:', error);
          }
        }
      };

      // Safely get page context - fallback to empty object if not available
      const pageContext = dataContextManager?.getPageContext?.() || {};

      let preparedData;
      try {
        preparedData = await executer(
          data,
          contextData,
          fileSaver,
          form,
          globalState,
          allData.http || null,
          message || null,
          allData.moment,
          pageContext,
          selectedRow || null,
          allData.setGlobalState
        );
      } catch (executerError) {
        console.error('Error in executer function:', executerError);
        return Promise.resolve(data);
      }

      // Validate and sanitize the returned data
      if (preparedData === undefined || preparedData === null) {
        // If handler doesn't return anything, use original data
        return Promise.resolve(data);
      }

      // If handler returns a non-object (like a string, number, boolean), use original data
      if (typeof preparedData !== 'object') {
        console.warn('OnListItemSave returned non-object value, using original data. Returned value:', preparedData);
        return Promise.resolve(data);
      }

      try {
        // Test if the data can be serialized (important for API calls)
        JSON.stringify(preparedData);
        return Promise.resolve(preparedData);
      } catch (serializationError) {
        console.warn('OnListItemSave returned non-serializable data, falling back to original data:', serializationError);
        return Promise.resolve(data);
      }
    };
  }, [onListItemSave, dataContextManager, message, selectedRow, allData.http, allData.moment, allData.setGlobalState]);

  const { executeAction } = useConfigurableActionDispatcher();
  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onListItemSaveSuccessAction)
      return () => {
        //nop
      };

    return (data, form, contexts, globalState, setGlobalState) => {
      const evaluationContext = {
        data,
        form,
        contexts,
        globalState,
        setGlobalState,
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

    return performOnRowSave(rowData, allData.form, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then((response) => {
        setRowData(rowIndex, preparedData/*, response*/);
        performOnRowSaveSuccess(preparedData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, allData.form, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      return repository.performCreate(0, preparedData, options).then(() => {
        dataSource.refreshTable();
        performOnRowSaveSuccess(preparedData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
      });
    });
  };

  const performOnRowDeleteSuccessAction = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowDeleteSuccessAction)
      return () => {
        /*nop*/
      };

    return (data, form, contexts, globalState, setGlobalState) => {
      const evaluationContext = {
        data,
        form,
        contexts,
        globalState,
        setGlobalState,
        http: allData.http,
        moment,
      };

      try {
        executeAction({
          actionConfiguration: onRowDeleteSuccessAction,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing row delete success action:', error);
      }
    };
  }, [onRowDeleteSuccessAction, allData.http]);


  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      performOnRowDeleteSuccessAction(rowData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
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

  // Only show configuration warning in design mode when truly misconfigured
  if (isDesignMode && !repository) {
    return <NotConfiguredWarning />;
  }

  // Form configuration warnings - only in design mode and when specific selection modes are used
  if (isDesignMode) {
    if (props.formSelectionMode === "name" && !props.formId) return <NotConfiguredWarning />;
    if (props.formSelectionMode === "view" && !props.formType) return <NotConfiguredWarning />;
    if (props.formSelectionMode === "expression" && !props.formIdExpression) return <NotConfiguredWarning />;
  }

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;

  if (groupingColumns?.length > 0 && props.orientation === "wrap") {
    return <EmptyState noDataText='Configuration Error' noDataSecondaryText='Wrap Orientation is not supported when Grouping is enabled.' />;
  }

  return (
    <ConfigurableFormItem
      model={{ ...props, hideLabel: true }}
      className={classNames(
        styles.shaDatalistComponent,
        { horizontal: props?.orientation === 'horizontal' && allData.form?.formMode !== 'designer' } //
      )}
      wrapperCol={{ md: 24 }}
    >

      <DataList
        {...props}
        createFormId={props.createFormId ?? props.formId}
        createFormType={props.createFormType ?? props.formType}
        canAddInline={canAction(canAddInline)}
        canEditInline={canAction(canEditInline)}
        showEditIcons={showEditIcons}
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
        grouping={grouping}
        groupingMetadata={groupingColumns?.map(item => item.metadata) ?? []}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
        createAction={creater}
        updateAction={updater}
        deleteAction={deleter}
        actionRef={dataListRef}
        modalWidth={width}
      />
    </ConfigurableFormItem>
  );
};

export default DataListControl;