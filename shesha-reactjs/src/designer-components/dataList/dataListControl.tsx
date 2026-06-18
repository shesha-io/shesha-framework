import React, { useRef } from 'react';
import { DataList } from '@/components/dataList';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import classNames from 'classnames';
import { IDataListWithDataSourceProps } from './model';
import { FCUnwrapped, useConfigurableAction, useConfigurableActionDispatcher, useForm } from '@/providers';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from '@/providers/dataTable/repository/backendRepository';
import { useStyles } from '@/components/dataList/styles/styles';
import { executeScript, useAvailableConstantsData } from '@/providers/form/utils';
import { useDeepCompareMemo } from '@/hooks';
import { YesNoInherit } from '@/interfaces';
import EmptyState from '@/components/emptyState';
import { OnSaveHandler, OnSaveSuccessHandler } from '@/components/dataTable/interfaces';
import { useComponentValidation } from '@/providers/validationErrors';
import { parseFetchError } from '@/designer-components/dataTable/utils';
import { DataListPlaceholder } from './dataListPlaceholder';
import { isDefined } from '@/utils/nullables';
import { ActionRefType } from '@/components/dataList/models';
import { ITableRowData } from '@/providers/dataTable/interfaces';

const DataListControl: FCUnwrapped<IDataListWithDataSourceProps, "dataSourceInstance"> = (props) => {
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

  // Handle null dataSource gracefully
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
    fetchTableDataError,
    selectedRow,
    selectedRows,
    setSelectedRow,
    clearSelectedRow,
    setMultiSelectedRow,
  } = dataSource;
  const { styles } = useStyles();
  const appContext = useAvailableConstantsData();
  const { formMode } = useForm();
  const isDesignMode = formMode === 'designer';
  const { executeAction } = useConfigurableActionDispatcher();

  const repository = getRepository();

  // Check if form configuration is invalid (for placeholder display in designer mode)
  const hasInvalidFormConfig = React.useMemo(() => {
    if (!isDesignMode) return false;

    if (props.formSelectionMode === "name") {
      if (!props.formId) return true;
      if (typeof props.formId === 'string' && props.formId.trim() === '') return true;
      if (typeof props.formId === 'object' && (!props.formId.name || props.formId.name.trim() === '')) return true;
    }
    if (props.formSelectionMode === "view" && (!props.formType || props.formType.trim() === '')) return true;
    if (props.formSelectionMode === "expression" && (!props.formIdExpression || props.formIdExpression.trim() === '')) return true;

    return false;
  }, [isDesignMode, props.formSelectionMode, props.formId, props.formType, props.formIdExpression]);

  // CRITICAL: Register validation errors - FormComponent will display them
  // Must be called before any conditional returns (React Hooks rules)
  // Note: Form configuration errors are handled by validateModel in dataListComponent.tsx
  useComponentValidation(
    () => {
      const errors: Array<{ propertyName: string; error: string }> = [];

      // Parse fetch errors from the data source
      if (fetchTableDataError) {
        errors.push(...parseFetchError(fetchTableDataError));
      }

      // Return validation result if there are errors
      if (errors.length > 0) {
        return {
          hasErrors: true,
          validationType: 'error' as const,
          errors,
        };
      }

      return undefined;
    },
    [fetchTableDataError, dataSource, repository],
  );

  // Event handlers for the new events
  const handleListItemClick = (index: number, item: ITableRowData): void => {
    if (onListItemClick) {
      const evaluationContext = { ...appContext, data: item, index, selectedItem: item, selectedIndex: index };
      executeAction({
        actionConfiguration: onListItemClick,
        argumentsEvaluationContext: evaluationContext,
      }).catch((error) => console.error('Error executing item click action:', error));
    }
  };

  const handleListItemHover = (index: number, item: ITableRowData): void => {
    if (onListItemHover) {
      const evaluationContext = { ...appContext, data: item, index, selectedItem: item, selectedIndex: index };
      executeAction({
        actionConfiguration: onListItemHover,
        argumentsEvaluationContext: evaluationContext,
      }).catch((error) => console.error('Error executing item hover action:', error));
    }
  };

  const handleListItemSelect = (index: number, item: ITableRowData): void => {
    if (onListItemSelect && props.selectionMode !== 'none') {
      const evaluationContext = { ...appContext, data: item, index, selectedItem: item, selectedIndex: index };
      executeAction({
        actionConfiguration: onListItemSelect,
        argumentsEvaluationContext: evaluationContext,
      }).catch((error) => console.error('Error executing item select action:', error));
    }
  };

  const handleSelectionChange = (selectedItems: ITableRowData[], selectedIndices: number[]): void => {
    if (onSelectionChange && props.selectionMode !== 'none') {
      const evaluationContext = {
        ...appContext,
        selectedItems,
        selectedIndices,
        selectedIds: selectedItems
          .map((item) => item.id)
          .filter(isDefined),
      };
      executeAction({
        actionConfiguration: onSelectionChange,
        argumentsEvaluationContext: evaluationContext,
      }).catch((error) => console.error('Error executing selection change action:', error));
    }
  };


  const dataListRef = useRef<ActionRefType>(undefined);
  useConfigurableAction(
    {
      name: 'Add new item (if allowed)',
      owner: props.componentName ?? "Data List",
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

  const data = useDeepCompareMemo<ITableRowData[]>(() => {
    if (isDesignMode) {
      // In designer mode, show actual data if available, otherwise show sample data
      if (tableData.length > 0) {
        return tableData;
      }

      // Provide sample data for design mode to show a realistic preview when no real data
      const sampleData = {
        id: '1',
        name: 'Sample Item',
        description: 'This is a sample description to demonstrate how your list items will look.',
        status: 'Active',
        creationTime: new Date().toISOString(),
        lastModificationTime: new Date().toISOString(),
      };
      return props.orientation === 'vertical'
        ? [sampleData]
        : [sampleData, { ...sampleData, id: '2', name: 'Sample Item 2' }, { ...sampleData, id: '3', name: 'Sample Item 3' }, { ...sampleData, id: '4', name: 'Sample Item 4' }];
    }
    return tableData;
  }, [isDesignMode, tableData, props.orientation]);

  // http, moment, setFormData
  const performOnRowDeleteSuccessAction: OnSaveSuccessHandler = !onRowDeleteSuccessAction
    ? () => {
      /* nop*/
    }
    : (data) => {
      const evaluationContext = { ...appContext, data };
      executeAction({
        actionConfiguration: onRowDeleteSuccessAction,
        argumentsEvaluationContext: evaluationContext,
      }).catch((error) => console.error('Error executing item delete success action:', error));
    };

  const performOnRowSaveSuccess: OnSaveSuccessHandler = !onListItemSaveSuccessAction
    ? () => {
      // nop
    }
    : (data) => {
      const evaluationContext = { ...appContext, data };
      // execute the action
      executeAction({
        actionConfiguration: onListItemSaveSuccessAction,
        argumentsEvaluationContext: evaluationContext,
      }).catch((error) => console.error('Error executing item save success action:', error));
    };

  const performOnRowSave: OnSaveHandler = !onListItemSave
    ? (data) => Promise.resolve(data)
    : (data) => {
      return executeScript(onListItemSave, { ...appContext, data });
    };

  const updater = (rowIndex: number, rowData: ITableRowData): Promise<ITableRowData> => {
    const repository = getRepository();

    return performOnRowSave(rowData).then((preparedData) => {
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

  const creater = (rowData: ITableRowData): Promise<ITableRowData> => {
    const repository = getRepository();

    return performOnRowSave(rowData).then((preparedData) => {
      const options =
        repository.repositoryType === BackendRepositoryType
          ? ({ customUrl: customCreateUrl } as ICreateOptions)
          : undefined;

      // use preparedData ?? rowData to handle the case when onRowSave returns undefined
      const finalData = preparedData ?? rowData;
      return repository.performCreate(0, finalData, options).then(() => {
        void dataSource.refreshTable();
        performOnRowSaveSuccess(finalData);
        return finalData;
      });
    });
  };

  const deleter = (rowIndex: number, rowData: ITableRowData): Promise<void> => {
    const repository = getRepository();

    const options =
      repository.repositoryType === BackendRepositoryType
        ? ({ customUrl: customDeleteUrl } as IDeleteOptions)
        : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      if (props.onRowDeleteSuccessAction) {
        performOnRowDeleteSuccessAction(rowData);
      }
      void dataSource.refreshTable();
    });
  };

  const canAction = (val: YesNoInherit | undefined): boolean => {
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

  // Show placeholder only when form config is invalid in designer mode
  // In designer mode with valid config, show sample data even without repository
  // In runtime mode without repository, show placeholder
  // Validation errors will be shown by parent FormComponent via useComponentValidation and validateModel
  if (isDesignMode && hasInvalidFormConfig) {
    return <DataListPlaceholder />;
  }

  if (!isDesignMode && !isDefined(repository)) {
    return <DataListPlaceholder />;
  }

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;

  if (groupingColumns.length > 0 && orientation === "wrap") {
    return <EmptyState noDataText="Configuration Error" noDataSecondaryText="Wrap Orientation is not supported when Grouping is enabled." />;
  }


  return (
    <ConfigurableFormItem
      model={{ ...props, hideLabel: true }}
      className={classNames(
        styles.shaDatalistComponent,
        { horizontal: props.orientation === 'horizontal' && appContext.form?.formMode !== 'designer' }, //
      )}
      wrapperCol={{ md: 24 }}
    >
      <DataList
        {...props}
        onRowDeleteSuccessAction={props.onRowDeleteSuccessAction}
        style={allStyles?.fullStyle as string}
        createFormId={props.createFormId ?? props.formId}
        createFormType={props.createFormType ?? props.formType}
        canAddInline={canAction(canAddInline)}
        canEditInline={canAction(canEditInline)}
        canDeleteInline={canAction(canDeleteInline)}
        noDataIcon={noDataIcon}
        noDataSecondaryText={noDataSecondaryText}
        noDataText={noDataText}
        entityType={modelType ?? undefined}
        onSelectRow={setSelectedRow}
        onClearSelectedRow={clearSelectedRow}
        onMultiSelectRows={setMultiSelectedRow}
        selectedRow={selectedRow}
        selectedRows={selectedRows}
        records={data}
        showEditIcons={showEditIcons}
        grouping={grouping}
        groupingMetadata={groupingColumns.map((item) => item.metadata).filter(isDefined)}
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
      />
    </ConfigurableFormItem>
  );
};

export default DataListControl;
