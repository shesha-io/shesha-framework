import React, { FC, useCallback, useMemo, useRef } from 'react';
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
import { OnSaveHandler, OnSaveSuccessHandler } from '@/components/dataTable/interfaces';
import { useComponentValidation } from '@/providers/validationErrors';

// Static placeholder shown when DataList has configuration errors
export const DataListPlaceholder: FC = () => {
  const { theme } = useStyles();

  // Show preview items that look like actual list items
  const previewItems = [
    { heading: 'Heading', subtext: 'Subtext' },
    { heading: 'Heading', subtext: 'Subtext' },
    { heading: 'Heading', subtext: 'Subtext' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Preview list items - clean placeholder style */}
      <div>
        {previewItems.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              marginBottom: index < previewItems.length - 1 ? '1px' : '0',
              borderTop: index === 0 ? `1px solid ${theme.colorBorder}` : 'none',
              borderBottom: `1px solid ${theme.colorBorder}`,
            }}
          >
            {/* Icon placeholder */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: theme.colorFillSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '18px',
                color: theme.colorTextQuaternary,
              }}
            >
              👤
            </div>
            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: '14px',
                  color: theme.colorTextSecondary,
                  marginBottom: '4px',
                }}
              >
                {item.heading}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: theme.colorTextTertiary,
                }}
              >
                {item.subtext}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper to get form configuration error message
const getFormConfigErrorMessage = (
  formSelectionMode: string,
  formId: any,
  formType: any,
  formIdExpression: any,
): string | undefined => {
  if (formSelectionMode === "name" && !formId) {
    return 'This Data List has no form selected. Selecting a Form tells the Data List what data structure it should use when rendering items.';
  }
  if (formSelectionMode === "view" && !formType) {
    return 'This Data List has no form type specified. Selecting a Form Type tells the Data List what data structure it should use when rendering items.';
  }
  if (formSelectionMode === "expression" && !formIdExpression) {
    return 'This Data List has no form identifier expression configured. Configuring an expression tells the Data List how to dynamically determine which form to use.';
  }
  return undefined;
};

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
  const appContext = useAvailableConstantsData();
  const { formMode } = useForm();
  const isDesignMode = formMode === 'designer';
  const { executeAction } = useConfigurableActionDispatcher();

  const repository = getRepository();

  // Get form configuration error message if any
  const formConfigErrorMessage = getFormConfigErrorMessage(
    props.formSelectionMode,
    props.formId,
    props.formType,
    props.formIdExpression,
  );
  const hasInvalidFormConfig = !!formConfigErrorMessage;

  // Register validation errors - FormComponent will display them
  useComponentValidation(
    props.id,
    props.componentName,
    'datalist',
    () => {
      // Check for missing repository
      if (!repository) {
        return {
          hasErrors: true,
          validationType: 'error',
          errors: [{
            propertyName: 'Missing Data Source',
            error: 'This Data List has no data source configured. Selecting a Data Source tells the Data List where to fetch data from.',
          }],
        };
      }

      // Check for invalid form configuration
      if (formConfigErrorMessage) {
        return {
          hasErrors: true,
          validationType: 'error',
          errors: [{
            propertyName: 'Missing Form Configuration',
            error: formConfigErrorMessage,
          }],
        };
      }

      return undefined;
    },
    [repository, formConfigErrorMessage],
  );

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
      const evaluationContext = { ...appContext, data: item, index, selectedItem: item, selectedIndex: index };
      try {
        executeAction({
          actionConfiguration: onListItemClick,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing item click action:', error);
      }
    }
  }, [onListItemClick, appContext.contexts.lastUpdate, executeAction]);

  const handleListItemHover = useCallback((index: number, item: any) => {
    if (onListItemHover) {
      const evaluationContext = { ...appContext, data: item, index, selectedItem: item, selectedIndex: index };
      try {
        executeAction({
          actionConfiguration: onListItemHover,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing item hover action:', error);
      }
    }
  }, [onListItemHover, appContext.contexts.lastUpdate, executeAction]);

  const handleListItemSelect = useCallback((index: number, item: any) => {
    if (onListItemSelect && props.selectionMode !== 'none') {
      const evaluationContext = { ...appContext, data: item, index, selectedItem: item, selectedIndex: index };
      try {
        executeAction({
          actionConfiguration: onListItemSelect,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing item select action:', error);
      }
    }
  }, [onListItemSelect, props.selectionMode, appContext.contexts.lastUpdate, executeAction]);

  const handleSelectionChange = useCallback((selectedItems: any[], selectedIndices: number[]) => {
    if (onSelectionChange && props.selectionMode !== 'none') {
      const evaluationContext = {
        ...appContext,
        selectedItems,
        selectedIndices,
        selectedIds: selectedItems
          .map((item) => item?.id)
          .filter((id) => id !== undefined && id !== null),
      };
      try {
        executeAction({
          actionConfiguration: onSelectionChange,
          argumentsEvaluationContext: evaluationContext,
        });
      } catch (error) {
        console.error('Error executing selection change action:', error);
      }
    }
  }, [onSelectionChange, props.selectionMode, appContext.contexts.lastUpdate, executeAction]);

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

  const data = useDeepCompareMemo(() => {
    if (isDesignMode) {
      // Provide sample data for design mode to show a realistic preview
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

  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onListItemSave) return (data) => Promise.resolve(data);

    return (data) => {
      return executeScript(onListItemSave, { ...appContext, data });
    };
  }, [onListItemSave, appContext.contexts.lastUpdate]);

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

  // When there's no repository or invalid form config, show placeholder
  // Validation errors will be shown by parent FormComponent via useComponentValidation
  if (!repository || hasInvalidFormConfig) {
    return <DataListPlaceholder />;
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
        { horizontal: props?.orientation === 'horizontal' && appContext.form?.formMode !== 'designer' }, //
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
      />
    </ConfigurableFormItem>
  );
};

export default DataListControl;
