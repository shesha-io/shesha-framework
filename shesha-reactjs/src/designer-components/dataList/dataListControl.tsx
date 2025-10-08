import React, { FC, useCallback, useMemo, useRef } from 'react';
import { Alert } from 'antd';
import { DataList } from '@/components/dataList';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import classNames from 'classnames';
import moment from 'moment';
import { IDataListWithDataSourceProps } from './model';
import { useConfigurableAction, useConfigurableActionDispatcher, useHttpClient } from '@/providers';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from '@/providers/dataTable/repository/backendRepository';
import { useStyles } from '@/components/dataList/styles/styles';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useDeepCompareMemo } from '@/hooks';
import { YesNoInherit } from '@/interfaces';
import { EmptyState } from '@/components';
import { IFormApi } from '@/providers/form/formApi';

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
    readOnly,
    noDataText = "No Data",
    noDataSecondaryText = "No data is available for this list",
    noDataIcon,
    allStyles,
    showEditIcons,
    onRowDeleteSuccessAction,
    orientation = 'vertical',
    onListItemClick,
    onListItemHover,
    onListItemSelect,
    onSelectionChange,
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
    setRowData,
  } = dataSource;
  const { styles } = useStyles();
  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSource;
  const httpClient = useHttpClient();
  const allData = useAvailableConstantsData();
  const isDesignMode = allData.form?.formMode === 'designer';
  const { executeAction } = useConfigurableActionDispatcher();

  const repository = getRepository();

  const onSelectRow = useCallback((index: number, row: any) => {
    if (row) {
      setSelectedRow(index, row);
    } else {
      // Handle deselection - clear the selection
      setSelectedRow(null, null);
    }
  }, [setSelectedRow]);

  // Event handlers for the new events
  const handleListItemClick = useCallback((index: number, item: any) => {
    if (onListItemClick) {
      const evaluationContext = {
        data: item,
        index,
        selectedItem: item,
        selectedIndex: index,
        formData: allData.data,
        globalState: allData.globalState,
        contexts: allData.contexts,
        http: httpClient,
        moment,
      };
      executeAction({
        actionConfiguration: onListItemClick,
        argumentsEvaluationContext: evaluationContext,
      });
    }
  }, [onListItemClick, allData, httpClient, executeAction]);

  const handleListItemHover = useCallback((index: number, item: any) => {
    if (onListItemHover) {
      const evaluationContext = {
        data: item,
        index,
        selectedItem: item,
        selectedIndex: index,
        formData: allData.data,
        globalState: allData.globalState,
        contexts: allData.contexts,
        http: httpClient,
        moment,
      };
      executeAction({
        actionConfiguration: onListItemHover,
        argumentsEvaluationContext: evaluationContext,
      });
    }
  }, [onListItemHover, allData, httpClient, executeAction]);

  const handleListItemSelect = useCallback((index: number, item: any) => {
    if (onListItemSelect) {
      const evaluationContext = {
        data: item,
        index,
        selectedItem: item,
        selectedIndex: index,
        formData: allData.data,
        globalState: allData.globalState,
        contexts: allData.contexts,
        http: httpClient,
        moment,
      };
      executeAction({
        actionConfiguration: onListItemSelect,
        argumentsEvaluationContext: evaluationContext,
      });
    }
  }, [onListItemSelect, allData, httpClient, executeAction]);

  const handleSelectionChange = useCallback((selectedItems: any[], selectedIndices: number[]) => {
    if (onSelectionChange) {
      const evaluationContext = {
        selectedItems,
        selectedIndices,
        selectedIds: selectedItems
          .map((item) => item?.id)
          .filter((id) => id !== undefined && id !== null),
        formData: allData.data,
        globalState: allData.globalState,
        contexts: allData.contexts,
        http: httpClient,
        moment,
      };
      executeAction({
        actionConfiguration: onSelectionChange,
        argumentsEvaluationContext: evaluationContext,
      });
    }
  }, [onSelectionChange, allData, httpClient, executeAction]);

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
    [],
  );

  // Check if formId configuration is missing or invalid
  const isFormIdMisconfigured = isDesignMode && (
    (!props.formId && props.formSelectionMode === "name") ||
    (!props.formType && props.formSelectionMode === "view") ||
    (!props.formIdExpression && props.formSelectionMode === "expression")
  );

  const data = useDeepCompareMemo(() => {
    // In designer mode, show real data if available and properly configured,
    // otherwise show mock data for layout preview
    if (isDesignMode) {
      // If we have real data and component is configured correctly, show it
      if (tableData && tableData.length > 0 && repository && !isFormIdMisconfigured) {
        return tableData;
      }

      // Otherwise show mock data for layout preview
      // If formId is misconfigured, always show 3 cards regardless of orientation
      if (isFormIdMisconfigured) {
        return [{}, {}, {}];
      }

      return orientation === 'vertical'
        ? [{}]
        : [{}, {}, {}, {}];
    }

    // In live mode, always use real data
    return tableData;
  }, [isDesignMode, tableData, orientation, repository, isFormIdMisconfigured]);

  // http, moment, setFormData
  const performOnRowDeleteSuccessAction = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowDeleteSuccessAction)
      return () => {
        /* nop*/
      };
    return (data, formApi, globalState, setGlobalState) => {
      const evaluationContext = {
        data,
        formApi,
        globalState,
        setGlobalState,
        http: httpClient,
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
  }, [onRowDeleteSuccessAction, httpClient]);


  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onListItemSave) return (data) => Promise.resolve(data);

    const executer = new Function('data, form, contexts, globalState, http, moment', onListItemSave);
    return (data, form, contexts, globalState) => {
      const preparedData = executer(data, form, contexts, globalState, allData.http, allData.moment);
      return Promise.resolve(preparedData);
    };
  }, [onListItemSave]);

  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onListItemSaveSuccessAction)
      return () => {
        // nop
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


  // Handle form properties discovered by DataList - register them with the data source
  const handleFormPropertiesDiscovered = useCallback((properties: string[]) => {
    if (properties.length > 0 && dataSource?.registerConfigurableColumns) {
      const virtualColumns = properties.map((prop, index) => ({
        id: `datalist_form_${prop}`,
        propertyName: prop,
        caption: prop,
        label: prop,
        columnType: 'data' as const,
        isVisible: false, // Hidden - just for data fetching
        sortOrder: index,
        itemType: 'item' as const,
        allowSorting: false,
      }));

      dataSource.registerConfigurableColumns(`datalist_${props.id}`, virtualColumns);

      // Refresh the data to include the new properties
      if (dataSource.refreshTable) {
        dataSource.refreshTable();
      }
    }
  }, [dataSource, props.id]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = getRepository();
    if (!repository) return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, allData.form, allData.contexts ?? {}, allData.globalState).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customUpdateUrl } as IUpdateOptions)
          : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then((response) => {
        setRowData(rowIndex, preparedData/* , response*/);
        performOnRowSaveSuccess(preparedData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
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
        performOnRowSaveSuccess(preparedData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
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
        performOnRowDeleteSuccessAction(rowData, allData.form, allData.contexts ?? {}, allData.globalState, allData.setGlobalState);
      }
      dataSource.refreshTable();
    });
  };

  const canAction = (val: YesNoInherit): boolean => {
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

  // Show alert only if repository is not configured
  if (isDesignMode && !repository) {
    return <NotConfiguredWarning />;
  }

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;

  if (groupingColumns?.length > 0 && orientation === "wrap") {
    return <EmptyState noDataText="Configuration Error" noDataSecondaryText="Wrap Orientation is not supported when Grouping is enabled." />;
  }


  return (
    <ConfigurableFormItem
      model={{ ...props, hideLabel: true }}
      className={classNames(
        styles.shaDatalistComponent,
        { horizontal: props?.orientation === 'horizontal' && allData.form?.formMode !== 'designer' }, //
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
        noDataIcon={isFormIdMisconfigured ? "ExclamationCircleOutlined" : noDataIcon}
        noDataSecondaryText={isFormIdMisconfigured ? "The datalist item form template (formId) is not configured correctly. Please configure the form selection in the component settings." : noDataSecondaryText}
        noDataText={isFormIdMisconfigured ? "Form Template Not Configured" : noDataText}
        entityType={modelType}
        onSelectRow={onSelectRow}
        onMultiSelectRows={setMultiSelectedRow}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={data}
        showEditIcons={showEditIcons}
        grouping={grouping}
        groupingMetadata={groupingColumns?.map((item) => item.metadata) ?? []}
        isFetchingTableData={isFetchingTableData}
        selectedIds={selectedIds}
        changeSelectedIds={changeSelectedIds}
        createAction={creater}
        updateAction={updater}
        deleteAction={deleter}
        actionRef={dataListRef}
        modalWidth={width ?? '60%'}
        onListItemClick={handleListItemClick}
        onListItemHover={handleListItemHover}
        onListItemSelect={handleListItemSelect}
        onSelectionChange={handleSelectionChange}
        onFormPropertiesDiscovered={handleFormPropertiesDiscovered}
      />
    </ConfigurableFormItem>
  );
};

export default DataListControl;
