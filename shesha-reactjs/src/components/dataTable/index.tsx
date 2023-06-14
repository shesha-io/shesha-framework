import React, { FC, useEffect, Fragment, MutableRefObject, useMemo, CSSProperties } from 'react';
import { Column, SortingRule, TableProps } from 'react-table';
import {
  LoadingOutlined,
} from '@ant-design/icons';
import { DataTableColumn, IShaDataTableProps, OnSaveHandler, OnSaveSuccessHandler, YesNoInherit } from './interfaces';
import { DataTableFullInstance } from 'providers/dataTable/contexts';
import { ModalProps } from 'antd/lib/modal';
import ReactTable from '../reactTable';
import { removeUndefinedProperties } from 'utils/array';
import { ValidationErrors } from '..';
import { FormMode, IFlatComponentsStructure, ROOT_COMPONENT_KEY, useConfigurableActionDispatcher, useDataTableStore, useForm, useGlobalState, useMetadata, useSheshaApplication } from 'providers';
import { camelcaseDotNotation, toCamelCase } from 'utils/string';
import { IReactTableProps, RowDataInitializer } from '../reactTable/interfaces';
import { usePrevious } from 'react-use';
import { getCellRenderer } from './cell';
import { BackendRepositoryType, ICreateOptions, IDeleteOptions, IUpdateOptions } from 'providers/dataTable/repository/backendRepository';
import { ITableDataColumn } from 'providers/dataTable/interfaces';
import { IColumnEditorProps, IFieldComponentProps, standardCellComponentTypes } from 'providers/datatableColumnsConfigurator/models';
import { useFormDesignerComponents } from 'providers/form/hooks';
import { executeScriptSync, getCustomEnabledFunc, getCustomVisibilityFunc } from 'providers/form/utils';
import moment from 'moment';
import { axiosHttp } from 'utils/fetchers';
import { IAnyObject } from 'interfaces';


export interface IIndexTableOptions {
  omitClick?: boolean;
}

export interface IIndexTableProps extends IShaDataTableProps, TableProps {
  tableRef?: MutableRefObject<Partial<DataTableFullInstance> | null>;
  options?: IIndexTableOptions;
  containerStyle?: CSSProperties;
  tableStyle?: CSSProperties;
  minHeight?: number;
  maxHeight?: number;
}

export interface IExtendedModalProps extends ModalProps {
  content?: string;
}

export const DataTable: FC<Partial<IIndexTableProps>> = ({
  useMultiselect: useMultiSelect,
  selectedRowIndex,
  onSelectRow,
  onDblClick,
  onMultiRowSelect,
  tableRef,
  onRowsChanged,
  onExportSuccess,
  onExportError,
  onFetchDataSuccess,
  onSelectedIdsChanged,
  onRowsReordered,
  allowRowDragAndDrop,
  options,
  containerStyle,
  tableStyle,
  customCreateUrl,
  customUpdateUrl,
  customDeleteUrl,
  onRowSave,
  onRowSaveSuccessAction: onRowSaveSuccess,
  ...props
}) => {
  const store = useDataTableStore();
  const { formMode, formData } = useForm(false) ?? { formMode: 'readonly', formData: {} };
  const { globalState } = useGlobalState();

  if (tableRef) tableRef.current = store;

  const {
    tableData,
    isFetchingTableData,
    totalPages,
    columns,
    pageSizeOptions,
    currentPage,
    selectedPageSize,
    tableFilter,
    onSelectRow: onSelectRowDeprecated,
    onDblClick: onDblClickDeprecated,
    selectedRow,
    selectedIds,
    tableSorting,
    quickSearch,
    onSort,
    changeSelectedIds,
    changeSelectedRow,
    setRowData,
    // succeeded,
    succeeded: { exportToExcel: exportToExcelSuccess },
    error: { exportToExcel: exportToExcelError },
  } = store;

  const onSelectRowLocal = (index: number, row: any) => {
    if (onSelectRow) {
      onSelectRow(index, row);
    }

    if (changeSelectedRow) {
      const rowId = row?.id;
      const currentId = store.selectedRow?.id;
      if (rowId !== currentId)
        changeSelectedRow(row);
    }
  };

  const previousIds = usePrevious(selectedIds);

  useEffect(() => {
    if (!(previousIds?.length === 0 && selectedIds?.length === 0) && typeof onSelectedIdsChanged === 'function') {
      onSelectedIdsChanged(selectedIds);
    }
  }, [selectedIds]);

  useEffect(() => {
    if (!isFetchingTableData && tableData?.length && onFetchDataSuccess) {
      onFetchDataSuccess();
    }
  }, [isFetchingTableData]);

  useEffect(() => {
    if (exportToExcelSuccess && onExportSuccess) {
      onExportSuccess();
    }
  }, [exportToExcelSuccess]);

  useEffect(() => {
    if (exportToExcelError && onExportError) {
      onExportError();
    }
  }, [exportToExcelError]);

  const handleSelectRow = onSelectRow || onSelectRowDeprecated;

  const dblClickHandler = onDblClick || onDblClickDeprecated;

  useEffect(() => {
    if (Boolean(handleSelectRow)) handleSelectRow(null, null);
  }, [
    tableData,
    isFetchingTableData,
    totalPages,
    columns,
    pageSizeOptions,
    currentPage,
    selectedPageSize,
    tableFilter,
    selectedRow,
    quickSearch,
    tableSorting,
  ]);

  useEffect(() => {
    if (onRowsChanged) {
      onRowsChanged(tableData);
    }
  }, [tableData]);

  const metadata = useMetadata(false)?.metadata;
  const { backendUrl } = useSheshaApplication();

  const toolboxComponents = useFormDesignerComponents();

  const onNewRowInitializeExecuter = useMemo<Function>(() => {
    return props.onNewRowInitialize
      ? new Function('formData, globalState, http, moment', props.onNewRowInitialize)
      : null;
  }, [props.onNewRowInitialize]);

  const onNewRowInitialize = useMemo<RowDataInitializer>(() => {
    const result: RowDataInitializer = props.onNewRowInitialize
      ? () => {
        // todo: replace formData and globalState with accessors (e.g. refs) and remove hooks to prevent unneeded re-rendering
        //return onNewRowInitializeExecuter(formData, globalState);
        const result = onNewRowInitializeExecuter(formData ?? {}, globalState, axiosHttp(backendUrl), moment);
        return Promise.resolve(result);
      }
      : () => {
        return Promise.resolve({});
      };

    return result;
  }, [onNewRowInitializeExecuter, formData, globalState]);

  const evaluateYesNoInheritJs = (value: YesNoInherit, jsExpression: string, formMode: FormMode, formData: any, globalState: IAnyObject): boolean => {
    switch (value) {
      case 'yes':
        return true;
      case 'no':
        return false;
      case 'inherit':
        return formMode === 'edit';
      case 'js': {
        return jsExpression && executeScriptSync<boolean>(jsExpression, { 
          "formData": formData, 
          "globalState": globalState, 
          "moment": moment 
        });
      }
    }
    return false;
  };

  const crudOptions = useMemo(() => {
    const result = {
      canDelete: evaluateYesNoInheritJs(props.canDeleteInline, props.canDeleteInlineExpression, formMode, formData, globalState),
      canEdit: evaluateYesNoInheritJs(props.canEditInline, props.canEditInlineExpression, formMode, formData, globalState),
      canAdd: evaluateYesNoInheritJs(props.canAddInline, props.canAddInlineExpression, formMode, formData, globalState),
      onNewRowInitialize,
    };
    return {
      ...result,
      enabled: result.canAdd || result.canDelete || result.canEdit,
    };
  }, [props.canDeleteInline, props.canEditInline, props.canAddInline, formMode, formData, globalState]);

  const preparedColumns = useMemo(() => {
    const localPreparedColumns = columns
      .filter(column => {
        return column.show && !(column.columnType === 'crud-operations' && !crudOptions.enabled);
      })
      .map<DataTableColumn>(columnItem => {
        const strictWidth = columnItem.minWidth && columnItem.maxWidth && columnItem.minWidth === columnItem.maxWidth
          ? columnItem.minWidth
          : undefined;

        const cellRenderer = getCellRenderer(columnItem, metadata);

        const column: DataTableColumn = {
          ...columnItem,
          accessor: camelcaseDotNotation(columnItem.accessor),
          Header: columnItem.header,
          minWidth: Boolean(columnItem.minWidth) ? columnItem.minWidth : undefined,
          maxWidth: Boolean(columnItem.maxWidth) ? columnItem.maxWidth : undefined,
          width: strictWidth,
          resizable: !strictWidth,
          disableSortBy: !columnItem.isSortable,
          disableResizing: Boolean(strictWidth),
          Cell: cellRenderer,
          originalConfig: columnItem,
        };
        return removeUndefinedProperties(column) as DataTableColumn;
      });

    return localPreparedColumns;
  }, [columns, crudOptions.enabled]);

  // sort
  const defaultSorting = tableSorting
    ? tableSorting.map<SortingRule<string>>(c => ({ id: c.id, desc: c.desc }))
    : columns
      .filter(c => c.defaultSorting !== null)
      .map<SortingRule<string>>(c => ({ id: c.id, desc: c.defaultSorting === 1 }));

  // http, moment, setFormData
  const performOnRowSave = useMemo<OnSaveHandler>(() => {
    if (!onRowSave)
      return data => Promise.resolve(data);

    const executer = new Function('data, formData, globalState, http, moment', onRowSave);
    return (data, formData, globalState) => {
      const preparedData = executer(data, formData, globalState, axiosHttp(backendUrl), moment);
      return Promise.resolve(preparedData);
    };
  }, [onRowSave, backendUrl]);

  const { executeAction } = useConfigurableActionDispatcher();
  const performOnRowSaveSuccess = useMemo<OnSaveSuccessHandler>(() => {
    if (!onRowSaveSuccess)
      return () => {  /*nop*/ };

    return (data, formData, globalState) => {
      const evaluationContext = {
        data: data,
        formData: formData,
        globalState: globalState,
        http: axiosHttp(backendUrl),
        moment: moment
      };
      // execute the action
      executeAction({
        actionConfiguration: onRowSaveSuccess,
        argumentsEvaluationContext: evaluationContext
      });
    };
  }, [onRowSaveSuccess, backendUrl]);

  const updater = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, formData ?? {}, globalState).then(preparedData => {
      const options = repository.repositoryType === BackendRepositoryType
        ? { customUrl: customUpdateUrl } as IUpdateOptions
        : undefined;

      return repository.performUpdate(rowIndex, preparedData, options).then(response => {
        setRowData(rowIndex, preparedData/*, response*/);
        performOnRowSaveSuccess(preparedData, formData ?? {}, globalState);
        return response;
      });
    });
  };

  const creater = (rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    return performOnRowSave(rowData, formData ?? {}, globalState).then(preparedData => {
      const options = repository.repositoryType === BackendRepositoryType
        ? { customUrl: customCreateUrl } as ICreateOptions
        : undefined;

      return repository.performCreate(0, preparedData, options).then(() => {
        store.refreshTable();
        performOnRowSaveSuccess(preparedData, formData ?? {}, globalState);
      });
    });
  };

  const deleter = (rowIndex: number, rowData: any): Promise<any> => {
    const repository = store.getRepository();
    if (!repository)
      return Promise.reject('Repository is not specified');

    const options = repository.repositoryType === BackendRepositoryType
      ? { customUrl: customDeleteUrl } as IDeleteOptions
      : undefined;

    return repository.performDelete(rowIndex, rowData, options).then(() => {
      store.refreshTable();
    });
  };

  const getCrudComponents = (allowEdit: boolean, componentAccessor: (col: ITableDataColumn) => IFieldComponentProps): IFlatComponentsStructure => {
    const result: IFlatComponentsStructure = {
      allComponents: {},
      componentRelations: {}
    };
    // don't calculate components settings when it's not required
    if (!allowEdit)
      return result;

    const componentIds: string[] = [];
    columns?.forEach(col => {
      if (col.columnType === 'data') {
        const dataCol = col as ITableDataColumn;
        const customComponent = componentAccessor(dataCol);
        const componentType = customComponent?.type ?? standardCellComponentTypes.notEditable;
        if (componentType && componentType !== standardCellComponentTypes.notEditable && componentType !== standardCellComponentTypes.defaultDisplay) {
          // component found
          const component = toolboxComponents[customComponent.type];
          if (!component) {
            console.error(`Datatable: component '${customComponent.type}' not found - skipped`);
            return;
          }

          const propertyMeta = metadata?.properties?.find(({ path }) => toCamelCase(path) === dataCol.id);

          let model: IColumnEditorProps = {
            ...customComponent.settings,
            id: dataCol.columnId,
            type: customComponent.type,
            name: dataCol.propertyName,
            label: null,
            hideLabel: true,
          };

          if (component.linkToModelMetadata && propertyMeta) {
            model = component.linkToModelMetadata(model, propertyMeta);
          }

          model.visibilityFunc = getCustomVisibilityFunc(model);
          model.enabledFunc = getCustomEnabledFunc(model);

          result.allComponents[model.id] = model;
          componentIds.push(model.id);
        };
      };
    });
    result.componentRelations[ROOT_COMPONENT_KEY] = componentIds;

    return result;
  };

  const inlineEditorComponents = useMemo<IFlatComponentsStructure>(() => {
    return getCrudComponents(crudOptions.canEdit, col => col.editComponent);
  }, [columns, metadata, crudOptions.canEdit]);

  const inlineCreatorComponents = useMemo<IFlatComponentsStructure>(() => {
    return getCrudComponents(crudOptions.canAdd, col => col.createComponent);
  }, [columns, metadata, crudOptions.canAdd]);

  const inlineDisplayComponents = useMemo<IFlatComponentsStructure>(() => {
    const result = getCrudComponents(true, col => col.displayComponent);
    return result;
  }, [columns, metadata]);

  const tableProps: IReactTableProps = {
    data: tableData,
    // Disable sorting if we're in create mode so that the new row is always the first
    defaultSorting: defaultSorting,
    useMultiSelect,
    onSelectRow: onSelectRowLocal,
    onRowDoubleClick: dblClickHandler,
    onSelectedIdsChanged: changeSelectedIds,
    onMultiRowSelect,
    onSort, // Update it so that you can pass it as param. Quick fix for now
    columns: preparedColumns as Column<any>[], // todo: make ReactTable generic and remove this cast
    selectedRowIndex,
    loading: isFetchingTableData,
    pageCount: totalPages,
    manualFilters: true, // informs React Table that you'll be handling sorting and pagination server-side
    manualPagination: true, // informs React Table that you'll be handling sorting and pagination server-side
    loadingText: (
      <span>
        <LoadingOutlined /> loading...
      </span>
    ),
    onRowsReordered,
    allowRowDragAndDrop,
    containerStyle,
    tableStyle,
    omitClick: options?.omitClick,

    canDeleteInline: crudOptions.canDelete,
    deleteAction: deleter,

    canEditInline: crudOptions.canEdit,
    updateAction: updater,

    canAddInline: crudOptions.canAdd,
    newRowCapturePosition: props.newRowCapturePosition,
    createAction: creater,
    newRowInitData: crudOptions.onNewRowInitialize,
    inlineEditMode: props.inlineEditMode,
    inlineSaveMode: props.inlineSaveMode,
    inlineEditorComponents,
    inlineCreatorComponents,
    inlineDisplayComponents,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
  };

  return (
    <Fragment>
      <div className="sha-child-table-error-container">
        {exportToExcelError && <ValidationErrors error={'Error occurred while exporting to excel'} />}
      </div>

      {tableProps.columns && tableProps.columns.length > 0 && <ReactTable {...tableProps} />}
    </Fragment>
  );
};

export default DataTable;