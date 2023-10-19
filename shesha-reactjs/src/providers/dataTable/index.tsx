import camelCaseKeys from 'camelcase-keys';
import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef
  } from 'react';
import { advancedFilter2JsonLogic, getCurrentSorting, getTableDataColumns } from './utils';
import { DataContextProvider, useDataContext } from 'providers/dataContextProvider';
import { dataTableReducer } from './reducer';
import { getFlagSetters } from '../utils/flagsSetters';
import { IHasModelType, IHasRepository, IRepository } from './repository/interfaces';
import { isEqual, sortBy } from 'lodash';
import { MetadataProvider } from 'providers/metadata';
import { Row } from 'react-table';
import { useConfigurableAction } from '../configurableActionsDispatcher';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useGlobalState } from '../globalState';
import { useLocalStorage } from 'hooks';
import { useThunkReducer } from '../../hooks/thunkReducer';
import { withBackendRepository } from './repository/backendRepository';
import { withFormFieldRepository } from './repository/inMemoryRepository';
import { withNullRepository } from './repository/nullRepository';
import { withUrlRepository } from './repository/urlRepository';
import {
  applyFilterAction,
  changeActionedRowAction,
  changeDisplayColumnAction,
  changeFilterAction,
  changeFilterOptionAction,
  changePageSizeAction,
  changePersistedFiltersToggleAction,
  changeQuickSearchAction,
  changeSelectedIdsAction,
  changeSelectedStoredFilterIdsAction,
  fetchColumnsSuccessSuccessAction,
  fetchTableDataAction,
  fetchTableDataErrorAction,
  fetchTableDataSuccessAction,
  onSortAction,
  registerConfigurableColumnsAction,
  setCurrentPageAction,
  setDataFetchingModeAction,
  setModelTypeAction,
  setPredefinedFiltersAction,
  setHiddenFilterAction,
  setRowDataAction,
  toggleColumnFilterAction,
  toggleColumnVisibilityAction,
  toggleSaveFilterModalAction,
  setSelectedRowAction,
  setMultiSelectedRowAction,
  fetchGroupingColumnsSuccessAction,
  setSortingSettingsAction,
} from './actions';
import {
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  DataTableActionsContext,
  DataTableStateContext,
  IDataTableStateContext,
  IDataTableUserConfig,
  IDataTableActionsContext,
} from './contexts';
import {
  ColumnFilter,
  DataFetchingMode,
  IColumnSorting,
  IFilterItem,
  IGetListDataPayload,
  IStoredFilter,
  ITableFilter,
  IndexColumnFilterOption,
  SortMode,
  ColumnSorting,
  GroupingItem,
} from './interfaces';
import {
  IConfigurableColumnsProps, IDataColumnsProps,
} from '../datatableColumnsConfigurator/models';

interface IDataTableProviderBaseProps {
  /** Configurable columns. Is used in pair with entityType  */
  configurableColumns?: IConfigurableColumnsProps[];

  /**
   * Used for storing the data table state in the global store and publishing and listening to events
   * If not provided, the state will not be saved globally and the user cannot listen to and publish events
   */
  actionOwnerId?: string;
  actionOwnerName?: string;

  defaultFilter?: IFilterItem[];

  initialPageSize?: number;

  dataFetchingMode: DataFetchingMode;
  
  defaultOrderBy?: string;
  defaultSortOrder?: string;

  /** Id of the user config, is used for saving of the user settings (sorting, paging etc) to the local storage. */
  userConfigId?: string;

  grouping?: GroupingItem[];
  sortMode?: SortMode;
  strictOrderBy?: string;
  strictSortOrder?: ColumnSorting;
}

interface IDataTableProviderWithRepositoryProps extends IDataTableProviderBaseProps, IHasRepository, IHasModelType {}

interface IHasDataSourceType {
  sourceType: 'Form' | 'Entity' | 'Url';
}
interface IHasFormDataSourceConfig {
  propertyName: string;
  getFieldValue?: (propertyName: string) => object[];
  onChange?: (...args: any[]) => void;
}
interface IUrlDataSourceConfig {
  getDataPath?: string;
  getExportToExcelPath?: string;
}
interface IHasEntityDataSourceConfig extends IUrlDataSourceConfig {
  /** Type of entity */
  entityType: string;
}

type IDataTableProviderProps = IDataTableProviderBaseProps &
  IHasDataSourceType &
  (IHasFormDataSourceConfig | IUrlDataSourceConfig | IHasEntityDataSourceConfig) & {};
const getTableProviderComponent = (props: IDataTableProviderProps): FC<IDataTableProviderBaseProps> => {
  const { sourceType } = props;
  switch (sourceType) {
    case 'Entity': {
      const { entityType, getDataPath } = props as IHasEntityDataSourceConfig;
      return withBackendRepository(DataTableProviderWithRepository, { entityType, getListUrl: getDataPath });
    }
    case 'Form': {
      const { propertyName, getFieldValue, onChange } = props as IHasFormDataSourceConfig;

      return withFormFieldRepository(DataTableProviderWithRepository, { propertyName, getFieldValue, onChange });
    };
    case 'Url':
      const { getDataPath } = props as IHasEntityDataSourceConfig;
      return withUrlRepository(DataTableProviderWithRepository, { getListUrl: getDataPath });
    default: {
      return withNullRepository(DataTableProviderWithRepository, {});
    }
  }
};

const getFilter = (state: IDataTableStateContext): string => {
  const allFilters = state.predefinedFilters ?? [];

  const filters = allFilters.filter(f => (state.selectedStoredFilterIds && state.selectedStoredFilterIds.indexOf(f.id) > -1));
  const { hiddenFilters } = state;

  if (hiddenFilters){
    for(const owner in hiddenFilters) {
      if (hiddenFilters.hasOwnProperty(owner) && hiddenFilters[owner]){
        filters.push(hiddenFilters[owner]);
  }
    }
  }

  let expressions = [];
  filters.forEach((f) => {
    if (f.expression) {
      const jsonLogic = typeof f.expression === 'string' ? JSON.parse(f.expression) : f.expression;
      expressions.push(jsonLogic);
    }
  });

  if (state.tableFilter) {
    const advancedFilter = advancedFilter2JsonLogic(state.tableFilter, state.columns);
    if (advancedFilter && advancedFilter.length > 0) expressions = expressions.concat(advancedFilter);
  }

  if (expressions.length === 0) return null;

  const jsonLogicFilters = expressions.length === 1 ? expressions[0] : { and: expressions };

  return JSON.stringify(jsonLogicFilters);
};

const getFetchListDataPayload = (state: IDataTableStateContext): IGetListDataPayload => {
  const dataColumns = getTableDataColumns(state.columns);

  if (state.groupingColumns && state.groupingColumns.length > 0){
    state.groupingColumns.forEach(groupColumn => {
      if (!dataColumns.find(column => column.propertyName === groupColumn.propertyName)){
        dataColumns.push(groupColumn);
      }        
    });
  }  
  const filter = getFilter(state);

  const payload: IGetListDataPayload = {
    columns: dataColumns,
    pageSize: state.dataFetchingMode === 'paging' ? state.selectedPageSize : -1,
    currentPage: state.dataFetchingMode === 'paging' ? state.currentPage : 1,
    sorting: getCurrentSorting(state),
    quickSearch: state.quickSearch,
    filter: filter,
  };
  return payload;
};

const DataTableWithMetadataProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  const modelType = (props as IHasEntityDataSourceConfig).entityType;

  return props.sourceType === 'Entity' && modelType
    ? <MetadataProvider id={props.userConfigId} modelType={modelType}>{props.children}</MetadataProvider>
    : <>{props.children}</>;
};

const DataTableProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  const component = useMemo(() => {
    return getTableProviderComponent(props);
  }, [props.sourceType]);

  return (
    <DataContextProvider
      id={'ctx_' + props.userConfigId}
      name={props.actionOwnerName}
      description={`Table context for ${props.actionOwnerName}`}
      type='table'
    >
      <DataTableWithMetadataProvider {...props}>
        {component(props)}
      </DataTableWithMetadataProvider>
    </DataContextProvider>
  );
};

export const DataTableProviderWithRepository: FC<PropsWithChildren<IDataTableProviderWithRepositoryProps>> = (
  props
) => {
  const {
    children,
    configurableColumns,
    actionOwnerId,
    actionOwnerName,
    initialPageSize,
    repository,
    userConfigId,
    modelType,
    dataFetchingMode,
    grouping,
    sortMode,
    strictOrderBy,
    strictSortOrder,
    defaultOrderBy: defaultSortBy,
    defaultSortOrder,
  } = props;

  const [state, dispatch] = useThunkReducer(dataTableReducer, {
    ...DATA_TABLE_CONTEXT_INITIAL_STATE,
    configurableColumns: configurableColumns,
    selectedPageSize: initialPageSize ?? DATA_TABLE_CONTEXT_INITIAL_STATE.selectedPageSize,
    dataFetchingMode: dataFetchingMode,
    modelType: modelType,
    grouping,
    sortMode,
    strictOrderBy,
    strictSortOrder,
    standardSorting: !!defaultSortBy ? [{id: defaultSortBy, desc: defaultSortOrder === 'desc'}] : [],
  });

  const { setState: setGlobalState } = useGlobalState();
  const tableIsReady = useRef(false);

  useDeepCompareEffect(() => {
    if (!grouping || grouping.length === 0) {
      dispatch(fetchGroupingColumnsSuccessAction({ grouping: [], columns: [] }));
    } else {
      const groupColumns = grouping.map<IDataColumnsProps>((col, index) => ({
        id: col.propertyName,
        columnType: 'data',
        propertyName: col.propertyName,
        isVisible: true,
        caption: col.propertyName,
        sortOrder: index,
        itemType: 'item'
      }));
      
      repository.prepareColumns(groupColumns).then(preparedColumns => {
        dispatch(fetchGroupingColumnsSuccessAction({ grouping: grouping, columns: preparedColumns }));
      });
    }
  }, [grouping]);

  const ctx = useDataContext(false);

  // sync sorting
  useEffect(() => {
    if (sortMode !== state.sortMode || strictOrderBy !== state.strictOrderBy || strictSortOrder !== state.strictSortOrder)
        dispatch(setSortingSettingsAction({ sortMode, strictOrderBy, strictSortOrder }));
  }, [sortMode, strictOrderBy, strictSortOrder]);

  // sync dataFetchingMode
  useEffect(() => {
    if (state.dataFetchingMode !== dataFetchingMode) dispatch(setDataFetchingModeAction(dataFetchingMode));
  }, [dataFetchingMode]);

  const [userConfig, setUserConfig] = useLocalStorage<IDataTableUserConfig>(userConfigId, null);

  useEffect(() => {
    if (modelType !== state.modelType) dispatch(setModelTypeAction(modelType));
  }, [modelType]);

  // fetch table data when config is ready or something changed (selected filter, changed current page etc.)
  useEffect(() => {
    fetchDataIfReady();
  }, [
    state.tableFilter,
    state.currentPage,
    state.selectedStoredFilterIds,
    state.selectedPageSize,
    state.dataFetchingMode,
    state.columns?.length,
    state.standardSorting,
    state.hiddenFilters,
    state.predefinedFilters,
    repository,
    state.groupingColumns,
    /*
    state.sortMode,
    state.strictOrderBy,
    state.strictSortOrder,
    */
  ]);

  const requireColumnRef = useRef<Boolean>(false);
  const requireColumns = () => {
    requireColumnRef.current = true;
  };

  // fetch table data when config is ready or something changed (selected filter, changed current page etc.)
  const fetchDataIfReady = () => {
    const groupingIsReady = (grouping ?? []).length === (state.groupingColumns ?? []).length;
    const columnsAreReady = !(requireColumnRef.current) || Boolean(state.configurableColumns) && state.columns.length === state.configurableColumns.length;

    const readyToFetch = repository && groupingIsReady && columnsAreReady;

    //console.log('LOG: fetchDataIfReady', readyToFetch);

    if (readyToFetch) {
      // fecth using entity type
      tableIsReady.current = true; // is used to prevent unneeded data fetch by the ReactTable. Any data fetch requests before this line should be skipped
      refreshTable();
    }
  };

  const refreshTable = () => {
    if (tableIsReady.current === true) {
      fetchTableData(state);
    }
  };

  const debouncedFetchInternal = useDebouncedCallback(
    (payload: IGetListDataPayload) => {
      // todo: check payload and skip fetching if the filters (or other required things) are not calculated
      const canFetch = true;
      if (canFetch) {
        repository
          .fetch(payload)
          .then((response) => {
            dispatch(fetchTableDataSuccessAction(response));
          })
          .catch((e) => {
            console.log(e);
            dispatch(fetchTableDataErrorAction());
          });
      } else {
        // skip fetching and return empty list
        dispatch(
          fetchTableDataSuccessAction({
            totalPages: 0,
            totalRows: 0,
            totalRowsBeforeFilter: 0,
            rows: [],
          })
        );
      }
    },
    // delay in ms
    300
  );

  const debouncedFetch = (payload: IGetListDataPayload) => {
    //console.log('LOG: fetch', payload);
    debouncedFetchInternal(payload);
  };

  const saveUserSettings = (state: IDataTableStateContext) => {
    setUserConfig({
      pageSize: state.selectedPageSize,
      currentPage: state.currentPage,
      quickSearch: state.quickSearch,
      columns: state.columns,
      tableSorting: state.standardSorting,
      advancedFilter: state.tableFilter,
      selectedFilterIds: state.selectedStoredFilterIds,
    });
  };

  const fetchTableDataInternal = (payload: IGetListDataPayload) => {
    dispatch(fetchTableDataAction(payload));

    if (tableIsReady.current === true) {
      debouncedFetch(payload);
    }
  };

  const fetchTableData = (providedState: IDataTableStateContext) => {
    // save user settings before fetch
    saveUserSettings(providedState);

    const payload = getFetchListDataPayload(providedState);
    fetchTableDataInternal(payload);
  };

  const setCurrentPage = (val: number) => {
    dispatch(setCurrentPageAction(val));
  };

  const changePageSize = (val: number) => {
    dispatch(changePageSizeAction(val));
  };

  const toggleColumnVisibility = (columnId: string) => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(toggleColumnVisibilityAction(columnId));

      // note: column visibility doesn't trigger data fetching, so we should save user settings manually here
      saveUserSettings(getState());
    });
  };

  const changeFilterOption = (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) =>
    dispatch(changeFilterOptionAction({ filterColumnId, filterOptionValue }));

  const changeFilter = (filterColumnId: string, filterValue: ColumnFilter) =>
    dispatch(changeFilterAction({ filterColumnId, filterValue }));

  const applyFilters = () => {
    const { tableFilterDirty } = state;

    dispatch(applyFilterAction(tableFilterDirty));
  };

  /** change quick search text without refreshing of the table data */
  const changeQuickSearch = (val: string) => {
    dispatch(changeQuickSearchAction(val));
  };

  /** change quick search and refresh table data */
  const performQuickSearch = (val: string) => {
    // note: use thunk to get state after update
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(changeQuickSearchAction(val));
      dispatchThunk(setCurrentPageAction(1));

      fetchTableData(getState());
    });
  };

  const toggleSaveFilterModal = (visible: boolean) => {
    dispatch(toggleSaveFilterModalAction(visible));
  };

  const clearFilters = () => {
    dispatch(toggleColumnFilterAction([]));
    dispatch(applyFilterAction([]));
  };

  const toggleColumnFilter = (ids: string[]) => {
    if (ids?.length) {
      dispatch(toggleColumnFilterAction(ids));
    } else {
      clearFilters();
    }
  };

  /*const changeSelectedRow = (val: any) => {
    const rowId = val?.id;
    const currentId = state.selectedRow?.id;

    // Initialize selectedRow to null
    let selectedRow = null;

    // If IDs are different and newRow exists, convert the newRow keys to camelCase
    if (newRowId !== currentRowId && newRow) {
      selectedRow = camelCaseKeys(newRow, { deep: true });
    }

    // todo: check current row mode and allow to toggle selection if row is in the read mode
    // Dispatch the updated row
    dispatch(changeSelectedRowAction(selectedRow));
  };*/

  const changeActionedRow = (val: any) => {
    dispatch(changeActionedRowAction(val ? camelCaseKeys(val, { deep: true }) : null));
  };

  const changeSelectedStoredFilterIds = (selectedFilterIds: string[]) => {
    dispatch(changeSelectedStoredFilterIdsAction(selectedFilterIds));
  };

  const setPredefinedFilters = (predefinedFilters: IStoredFilter[]) => {
    const filtersChanged = !isEqual(sortBy(state?.predefinedFilters), sortBy(predefinedFilters));

    if (filtersChanged) {
      dispatch(setPredefinedFiltersAction({ predefinedFilters, userConfig }));
    }
  };

  const setHiddenFilter = (owner: string, filter: IStoredFilter) => {
    dispatch(setHiddenFilterAction({ owner, filter }));
  };

  const changeSelectedIds = (selectedIds: string[]) => {
    dispatch(changeSelectedIdsAction(selectedIds));
  };

  const registerConfigurableColumns = (ownerId: string, configurableColumns: IConfigurableColumnsProps[]) => {
    dispatch((dispatchThunk, _getState) => {
      dispatchThunk(registerConfigurableColumnsAction({ ownerId, columns: configurableColumns }));

      repository.prepareColumns(configurableColumns).then((preparedColumns) => {
        dispatchThunk(fetchColumnsSuccessSuccessAction({ configurableColumns, columns: preparedColumns, userConfig }));
      });
    });
  };

  const getCurrentFilter = (): ITableFilter[] => {
    return state.tableFilterDirty || state.tableFilter || [];
  };

  const onSort = (sorting: IColumnSorting[]) => {
    dispatch(onSortAction(sorting));
  };

  const flagSetters = getFlagSetters(dispatch);

  //#region public

  const toggleColumnsSelector = () => {
    const {
      isInProgress: { isSelectingColumns },
    } = state;
    flagSetters?.setIsInProgressFlag({ isSelectingColumns: !isSelectingColumns, isFiltering: false });
  };

  const toggleAdvancedFilter = () => {
    const {
      isInProgress: { isFiltering },
    } = state;
    flagSetters?.setIsInProgressFlag({ isFiltering: !isFiltering, isSelectingColumns: false });
  };

  const changeDisplayColumn = (displayColumnName: string) => {
    dispatch(changeDisplayColumnAction(displayColumnName));
  };

  const changePersistedFiltersToggle = (persistSelectedFilters: boolean) => {
    dispatch(changePersistedFiltersToggleAction(persistSelectedFilters));
  };

  const exportToExcel = (): Promise<void> => {
    const payload = getFetchListDataPayload(state);
    return repository.exportToExcel(payload);
  };

  //#endregion

  //#region Subscriptions
  const getPartialState = () => {
    const { actionedRow, selectedIds, selectedRow, tableData } = state;
    return { actionedRow, selectedIds, selectedRow, tableData };
  };
  const partialState = getPartialState();
  
  useDeepCompareEffect(() => {
    // write state by name
    if (actionOwnerName) {
      setGlobalState({
        key: actionOwnerName,
        data: { 
          ...partialState,
          refreshTable },
      });
    }
  }, [partialState, actionOwnerName]);

  useConfigurableAction(
    {
      name: 'Refresh table',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        refreshTable(); // todo: return correct promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Export to Excel',
      description: 'Export current table view to Excel',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        return exportToExcel();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Toggle Advanced Filter',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        toggleAdvancedFilter(); // return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Toggle Columns Selector',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        toggleColumnsSelector(); // return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  //#endregion

  // todo: pass row index
  const setRowData = (rowIndex: number, rowData: any) => {
    dispatch(setRowDataAction({ rowIndex, rowData: rowData }));
  };

  const getRepository = (): IRepository => repository;

  const setSelectedRow = (index: number, row: any) => {
    dispatch(setSelectedRowAction(state.selectedRow?.id !== row?.id ? { index, row, id: row?.id } : null));
  };

  const setMultiSelectedRow = (rows: Row[] | Row) => {
    dispatch(setMultiSelectedRowAction(rows));
  };

  const actions: IDataTableActionsContext = {
    onSort,
    ...flagSetters,
    changeDisplayColumn,
    setCurrentPage,
    changePageSize,
    toggleColumnVisibility,
    toggleColumnFilter,
    changeFilterOption,
    changeFilter,
    applyFilters,
    clearFilters,
    changeQuickSearch,
    performQuickSearch,
    toggleSaveFilterModal,
    changeActionedRow,
    changeSelectedStoredFilterIds,
    setPredefinedFilters,
    setHiddenFilter,
    changeSelectedIds,
    refreshTable,
    registerConfigurableColumns,
    getCurrentFilter,
    changePersistedFiltersToggle,
    getRepository,
    setRowData,
    setSelectedRow,
    setMultiSelectedRow,
    requireColumns,
  };

  const contextOnChangeData = <T,>(_data: T, changedData: IDataTableStateContext) => {
    if (!changedData)
      return;

    if (changedData.quickSearch !== undefined && changedData.quickSearch !== state.quickSearch) {
      changeQuickSearch(changedData.quickSearch);
      return;
    }

    if (changedData.currentPage !== undefined && changedData.currentPage !== state.currentPage) {
      setCurrentPage(changedData.currentPage);
      return;
    }
  };

  // update context data
  /*useEffect(() => {
    ctx.setData({
      selectedRow: state.selectedRow,
      selectedIds: state.selectedIds,
      currentPage: state.currentPage,
      tableData: state.tableData,
      quickSearch: state.quickSearch
    });
    ctx.updateApi(actions);
    ctx.updateOnChangeData(contextOnChangeData);
  }, []);*/

  useEffect(() => {
    ctx.setData({
      selectedRow: state.selectedRow,
      selectedIds: state.selectedIds,
      currentPage: state.currentPage,
      tableData: state.tableData,
      quickSearch: state.quickSearch
    });
    ctx.updateApi(actions);
    ctx.updateOnChangeData(contextOnChangeData); // update context.onChangeData function to use new State
  }, [state.selectedRow, state.selectedIds, state.currentPage, state.tableData, state.quickSearch]);

  return (
    <DataTableStateContext.Provider value={state}>
      <DataTableActionsContext.Provider value={actions}>
        {children}
      </DataTableActionsContext.Provider>
    </DataTableStateContext.Provider>
  );
};

function useDataTableState(require: boolean = true) {
  const context = useContext(DataTableStateContext);

  if (context === undefined && require) {
    throw new Error('useDataTableState must be used within a DataTableProvider');
  }

  return context;
}

function useDataTableActions(require: boolean = true) {
  const context = useContext(DataTableActionsContext);

  if (context === undefined && require) {
    throw new Error('useDataTableActions must be used within a DataTableProvider');
  }

  return context;
}

function useDataTableStore(require: boolean = true) {
  const actionsContext = useDataTableActions(require);
  const stateContext = useDataTableState(require);

  if ((actionsContext === undefined || actionsContext === undefined) && require) {
    throw new Error('useDataTableActions must be used within a DataTableProvider');
  }
  // useContext() returns initial state when provider is missing
  // initial context state is useless especially when require == true
  // so we must return value only when both context are available
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
}

const useDataTable = useDataTableStore;

export default DataTableProvider;
export { DataTableProvider, useDataTable, useDataTableActions, useDataTableState, useDataTableStore };
