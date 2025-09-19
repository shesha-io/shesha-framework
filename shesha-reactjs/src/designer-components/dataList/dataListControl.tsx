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
import { getDefaultMockData } from './mockData';
import defaultPersonFormTemplate from './defaultPersonFormTemplate.json';
import { useMetadataDispatcher } from '@/providers';
import { DataTypes } from '@/interfaces';

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
    setRowData,
  } = dataSource;
  const { styles } = useStyles();
  const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = dataSource;
  const httpClient = useHttpClient();
  const allData = useAvailableConstantsData();
  const isDesignMode = allData.form?.formMode === 'designer';
  const { executeAction } = useConfigurableActionDispatcher();
  const metadataDispatcher = useMetadataDispatcher();
  // TODO: Need to implement proper form fetching

  const repository = getRepository();

  // Register configurable columns for field fetching
  const registerConfigurableColumns = dataSource?.registerConfigurableColumns;
  const requireColumns = dataSource?.requireColumns;

  // Call requireColumns to indicate that this DataList needs columns functionality
  React.useEffect(() => {
    if (requireColumns) {
      requireColumns();
    }
  }, [requireColumns]);

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
      ? getDefaultMockData(orientation)
      : tableData;
  }, [isDesignMode, tableData, orientation]);

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

  const isFormMissing = isDesignMode && (
    !repository
    || !props.formId && props.formSelectionMode === "name"
    || !props.formType && props.formSelectionMode === "view"
    || !props.formIdExpression && props.formSelectionMode === "expression"
  );

  const width = props.modalWidth === 'custom' && props.customWidth ? `${props.customWidth}${props.widthUnits}` : props.modalWidth;

  // Register all entity properties for fetching
  const registerAllEntityProperties = useCallback(async () => {
    if (!registerConfigurableColumns || !modelType) {
      return;
    }

    try {
      if (isDesignMode) console.warn(`DataList (${props.id}): Registering all properties for entity:`, modelType);

      // Get entity metadata to fetch all available properties
      const metadata = await metadataDispatcher.getMetadata({
        dataType: DataTypes.entityReference,
        modelType: modelType
      });

      if (metadata?.properties) {
        // Create virtual columns for all entity properties
        const allProperties = Object.keys(metadata.properties);
        const virtualColumns = allProperties.map((propertyName, index) => ({
          id: `datalist_all_${propertyName}`,
          propertyName: propertyName,
          caption: propertyName,
          itemType: 'item' as const,
          sortOrder: index,
          isVisible: false, // Hidden columns, only for field fetching
          columnType: 'data' as const,
          propertiesToFetch: propertyName,
        }));

        // Register all properties as virtual columns
        registerConfigurableColumns(`datalist_all_${props.id}`, virtualColumns);

        if (isDesignMode) {
          console.warn(`DataList (${modelType}): Registered ${allProperties.length} properties for fetching:`, allProperties.join(', '));
        }
      } else {
        // Fallback to common properties if metadata not available
        const fallbackProperties = ['id', 'firstName', 'lastName', 'jobTitle', 'name', 'displayName', 'email', 'phoneNumber'];
        const virtualColumns = fallbackProperties.map((propertyName, index) => ({
          id: `datalist_fallback_${propertyName}`,
          propertyName: propertyName,
          caption: propertyName,
          itemType: 'item' as const,
          sortOrder: index,
          isVisible: false,
          columnType: 'data' as const,
          propertiesToFetch: propertyName,
        }));

        registerConfigurableColumns(`datalist_fallback_${props.id}`, virtualColumns);

        if (isDesignMode) {
          console.warn(`DataList (${modelType}): Using fallback properties:`, fallbackProperties.join(', '));
        }
      }
    } catch (error) {
      console.error(`DataList: Failed to register entity properties for ${modelType}:`, error);
    }
  }, [registerConfigurableColumns, isDesignMode, props.id, modelType, metadataDispatcher]);

  // Effect to register all entity properties when modelType changes
  React.useEffect(() => {
    if (modelType) {
      registerAllEntityProperties().catch(error => {
        console.error('Failed to register entity properties:', error);
      });
    }
  }, [modelType, registerAllEntityProperties]);

  const dataListProps = useMemo(() => {
    const baseProps = {
      ...props,
      onRowDeleteSuccessAction: props.onRowDeleteSuccessAction,
      style: allStyles.fullStyle as string,
      createFormId: props.createFormId ?? props.formId,
      createFormType: props.createFormType ?? props.formType,
      canAddInline: canAction(canAddInline),
      canEditInline: canAction(canEditInline),
      canDeleteInline: canAction(canDeleteInline),
      noDataIcon,
      noDataSecondaryText,
      noDataText,
      entityType: modelType,
      onSelectRow,
      onMultiSelectRows: setMultiSelectedRow,
      selectedRow,
      selectedRows,
      records: data,
      grouping,
      groupingMetadata: groupingColumns?.map(item => item.metadata) ?? [],
      isFetchingTableData,
      selectedIds,
      changeSelectedIds,
      createAction: creater,
      updateAction: updater,
      deleteAction: deleter,
      actionRef: dataListRef,
      modalWidth: width ?? '60%',
    };

    // If form is missing in design mode, provide default template
    if (isFormMissing) {
      baseProps.formId = { name: 'PersonListTemplate', module: 'Default' };
      baseProps.formSelectionMode = 'name';
    }

    return baseProps;
  }, [props, isFormMissing, canAddInline, canEditInline, canDeleteInline, data, selectedRow, selectedRows]);

  if (groupingColumns?.length > 0 && orientation === "wrap") {
    return <EmptyState noDataText="Configuration Error" noDataSecondaryText="Wrap Orientation is not supported when Grouping is enabled." />;
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

      <DataList {...dataListProps} />
    </ConfigurableFormItem>
  );
};

export default DataListControl;
