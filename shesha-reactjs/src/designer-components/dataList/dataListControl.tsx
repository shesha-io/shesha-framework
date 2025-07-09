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
    onRowDeleteSuccessAction,
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
  const httpClient = useHttpClient();
  const allData = useAvailableConstantsData();
  const isDesignMode = allData.form?.formMode === 'designer';
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
      ? props.orientation === 'vertical'
        ? [{}]
        : [{}, {}, {}, {}]
      : tableData;
  }, [isDesignMode, tableData, props.orientation]);

  // http, moment, setFormData
     const performOnRowDeleteSuccessAction = useMemo<OnSaveSuccessHandler>(() => {
        if (!onRowDeleteSuccessAction)
          return () => {
            /*nop*/
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

  if (isDesignMode
    && (
      !repository
      || !props.formId && props.formSelectionMode === "name"
      || !props.formType && props.formSelectionMode === "view"
      || !props.formIdExpression && props.formSelectionMode === "expression"
    )) return <NotConfiguredWarning />;

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