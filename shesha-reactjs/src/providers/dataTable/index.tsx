import React, {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { advancedFilter2JsonLogic, getCurrentSorting, getTableDataColumns, getTableFormColumns } from './utils';
import { dataTableReducer } from './reducer';
import { getFlagSetters } from '../utils/flagsSetters';
import { IHasModelType, IHasRepository, IRepository } from './repository/interfaces';
import { isEqual, sortBy } from 'lodash';
import { MetadataProvider } from '@/providers/metadata';
import { Row } from 'react-table';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useGlobalState } from '@/providers/globalState';
import { useLocalStorage } from '@/hooks';
import { useThunkReducer } from '@/hooks/thunkReducer';
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
  setPermanentFilterAction,
  setRowDataAction,
  toggleColumnFilterAction,
  toggleColumnVisibilityAction,
  toggleSaveFilterModalAction,
  setSelectedRowAction,
  setMultiSelectedRowAction,
  fetchGroupingColumnsSuccessAction,
  setSortingSettingsAction,
  setDraggingRowAction,
  setStandardSortingAction,
  onGroupAction,
  removeColumFilterAction,
} from './actions';
import {
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  DataTableActionsContext,
  DataTableStateContext,
  IDataTableStateContext,
  IDataTableUserConfig,
  IDataTableActionsContext,
  DragState,
  ITableColumnUserSettings,
  IColumnWidth,
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
  ISortingItem,
  DataFetchDependencies,
  DataFetchDependency,
  DataFetchDependencyStateSwitcher,
  ITableColumn,
  FilterExpression,
} from './interfaces';
import {
  IConfigurableColumnsProps, IDataColumnsProps,
} from '../datatableColumnsConfigurator/models';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { dataTableContextCode } from '@/publicJsApis';
import { DataTypes, IObjectMetadata } from '@/index';
import { IModelMetadata } from '@/interfaces/metadata';

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

  standardSorting?: ISortingItem[];

  /** Id of the user config, is used for saving of the user settings (sorting, paging etc) to the local storage. */
  userConfigId?: string;

  grouping?: GroupingItem[];
  sortMode?: SortMode;
  strictSortBy?: string;
  strictSortOrder?: ColumnSorting;
  allowReordering?: boolean;
  /**
   * Permanent filter exepression. Always applied irrespectively of other filters
   */
  permanentFilter?: FilterExpression;

  /**
   * Disable refresh data expression
   * Return 'true' if datatableContext is not ready to refresh data (filter data is not ready, etc...)
   */
  disableRefresh?: boolean;

  /**
   * Custom reorder endpoint
   */
  customReorderEndpoint?: string;

  needToRegisterContext?: boolean;
}

interface IDataTableProviderWithRepositoryProps extends IDataTableProviderBaseProps, IHasRepository, IHasModelType { }

interface IHasDataSourceType {
  sourceType: 'Form' | 'Entity' | 'Url';
}
export interface IHasFormDataSourceConfig {
  propertyName: string;
  getFieldValue?: (propertyName: string) => object[];
  metadata?: IModelMetadata;
  onChange?: (...args: any[]) => void;
}
interface IUrlDataSourceConfig {
  getDataPath?: string;
  getExportToExcelPath?: string;
}
export interface IHasEntityDataSourceConfig extends IUrlDataSourceConfig {
  /** Type of entity */
  entityType: string;
}

const getFilter = (state: IDataTableStateContext): string => {
  const allFilters = state.predefinedFilters ?? [];

  const filters = allFilters.filter((f) => (state.selectedStoredFilterIds && state.selectedStoredFilterIds.indexOf(f.id) > -1));
  const { permanentFilter } = state;

  const filterExpression2Object = (filter: FilterExpression): object => {
    return typeof filter === 'string' ? JSON.parse(filter) : filter;
  };

  let expressions = [];
  filters.forEach((f) => {
    if (f.expression) {
      expressions.push(filterExpression2Object(f.expression));
    }
  });
  // add permanent filter if specified
  if (permanentFilter)
    expressions.push(filterExpression2Object(permanentFilter));

  if (state.tableFilter) {
    const advancedFilter = advancedFilter2JsonLogic(state.tableFilter, state.columns);
    if (advancedFilter && advancedFilter.length > 0) expressions = expressions.concat(advancedFilter);
  }

  if (expressions.length === 0) return null;

  const jsonLogicFilters = expressions.length === 1 ? expressions[0] : { and: expressions };

  return JSON.stringify(jsonLogicFilters);
};

const getFetchListDataPayload = (state: IDataTableStateContext, repository: IRepository): IGetListDataPayload => {
  const dataColumns = getTableDataColumns(state.columns);

  const groupingSupported = repository.supportsGrouping && repository.supportsGrouping({ sortMode: state.sortMode });

  if (dataColumns.length > 0 && groupingSupported && state.groupingColumns && state.groupingColumns.length > 0) {
    state.groupingColumns.forEach((groupColumn) => {
      if (!dataColumns.find((column) => column.propertyName === groupColumn.propertyName)) {
        dataColumns.push(groupColumn);
      }
    });
  }
  const filter = getFilter(state);

  if (state.sortMode === 'strict' && state.strictSortBy) {
    if (!dataColumns.find((column) => column.propertyName === state.strictSortBy))
      dataColumns.push({
        propertyName: state.strictSortBy,
        propertiesToFetch: [state.strictSortBy],
        dataType: 'number',
        columnType: 'data',
        accessor: state.strictSortBy,
        header: '',
        isVisible: false,
        isFilterable: false,
        isSortable: false,
      });
  }

  getTableFormColumns(state.columns).forEach((col) => dataColumns.push(col));

  const payload: IGetListDataPayload = {
    columns: dataColumns,
    pageSize: state.dataFetchingMode === 'paging' ? state.selectedPageSize : -1,
    currentPage: state.dataFetchingMode === 'paging' ? state.currentPage : 1,
    sorting: getCurrentSorting(state, groupingSupported),
    quickSearch: state.quickSearch,
    filter: filter,
  };
  return payload;
};

const DataTableWithMetadataProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  const modelType = (props as IHasEntityDataSourceConfig).entityType;

  return props.sourceType === 'Entity' && modelType
    ? <MetadataProvider id={props.userConfigId} modelType={modelType}>{props.children}</MetadataProvider>
    // use metadata provider with empty model to reset metadata (clear property list for column editor)
    : <MetadataProvider id={props.userConfigId} modelType="">{props.children}</MetadataProvider>;
};

const sortingItems2ColumnSorting = (items: ISortingItem[]): IColumnSorting[] => {
  return items
    ? items.map<IColumnSorting>((item) => ({ id: item.propertyName, desc: item.sorting === 'desc' }))
    : [];
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
    strictSortBy,
    strictSortOrder,
    standardSorting: sortingItems,
    allowReordering = false,
    permanentFilter,
    customReorderEndpoint,
    needToRegisterContext = true,
  } = props;

  const [state, dispatch] = useThunkReducer(dataTableReducer, {
    ...DATA_TABLE_CONTEXT_INITIAL_STATE,
    configurableColumns: configurableColumns,
    selectedPageSize: initialPageSize ?? DATA_TABLE_CONTEXT_INITIAL_STATE.selectedPageSize,
    dataFetchingMode: dataFetchingMode,
    modelType: modelType,
    grouping,
    sortMode,
    strictSortBy,
    strictSortOrder,
    allowReordering,
    standardSorting: sortingItems2ColumnSorting(sortingItems),
    permanentFilter,
    customReorderEndpoint,
  });

  const changePageSize = (val: number) => {
    dispatch(changePageSizeAction(val));
  };

  useEffect(() => {
    // sync page size on settings change
    if (state.selectedPageSize !== initialPageSize) {
      changePageSize(initialPageSize);
    }
  }, [initialPageSize]);

  const setPermanentFilter = (filter: FilterExpression) => {
    const currentFilter = state.permanentFilter;
    if (!isEqual(currentFilter, filter))
      dispatch(setPermanentFilterAction({ filter }));
  };

  useEffect(() => {
    setPermanentFilter(permanentFilter);
  }, [permanentFilter]);

  const { setState: setGlobalState } = useGlobalState();
  const tableIsReady = useRef(false);

  // sync standard sorting
  useDeepCompareEffect(() => {
    const sorting = sortingItems2ColumnSorting(sortingItems);
    dispatch(setStandardSortingAction(sorting));
  }, [sortingItems]);

  useDeepCompareEffect(() => {
    const supported = repository.supportsGrouping && repository.supportsGrouping({ sortMode });

    if (!grouping || grouping.length === 0 || !supported) {
      dispatch(fetchGroupingColumnsSuccessAction({ grouping: [], columns: [] }));
    } else {
      const groupColumns = grouping.map<IDataColumnsProps>((col, index) => ({
        id: col.propertyName,
        columnType: 'data',
        propertyName: col.propertyName,
        isVisible: true,
        caption: col.propertyName,
        sortOrder: index,
        itemType: 'item',
        allowSorting: true,
      }));

      repository.prepareColumns(groupColumns).then((preparedColumns) => {
        dispatch(fetchGroupingColumnsSuccessAction({ grouping: state.grouping, columns: preparedColumns }));
      });
    }
  }, [state.grouping, sortMode]);

  // sync ordering
  useEffect(() => {
    if (sortMode !== state.sortMode || strictSortBy !== state.strictSortBy || strictSortOrder !== state.strictSortOrder || allowReordering !== state.allowReordering)
      dispatch(setSortingSettingsAction({ sortMode, strictSortBy, strictSortOrder, allowReordering }));
  }, [sortMode, strictSortBy, strictSortOrder, allowReordering]);

  // sync dataFetchingMode
  useEffect(() => {
    if (state.dataFetchingMode !== dataFetchingMode) dispatch(setDataFetchingModeAction(dataFetchingMode));
  }, [dataFetchingMode]);

  const [userConfig, setUserConfig] = useLocalStorage<IDataTableUserConfig>(userConfigId, null);

  useEffect(() => {
    if (modelType !== state.modelType) dispatch(setModelTypeAction(modelType));
  }, [modelType]);

  const requireColumnRef = useRef<boolean>(false);
  const requireColumns = () => {
    requireColumnRef.current = true;
  };

  const dataFetchDependencies = useRef<DataFetchDependencies>({});
  const registerDataFetchDependency = (ownerId: string, dependency: DataFetchDependency) => {
    dataFetchDependencies.current[ownerId] = dependency;
  };
  const unregisterDataFetchDependency = (ownerId: string) => {
    delete dataFetchDependencies.current[ownerId];
  };

  const isDataDependenciesReady = (): boolean => {
    const deps = dataFetchDependencies.current;
    for (const depName in deps) {
      if (deps.hasOwnProperty(depName) && deps[depName].state !== 'ready')
        return false;
    }
    return true;
  };

  const debouncedFetchInternal = useDebouncedCallback(
    (payload: IGetListDataPayload) => {
      // TODO: check payload and skip fetching if the filters (or other required things) are not calculated
      const canFetch = true;
      if (canFetch) {
        repository
          .fetch(payload)
          .then((response) => {
            dispatch(fetchTableDataSuccessAction(response));
          })
          .catch((e) => {
            console.error(e);
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
    debouncedFetchInternal(payload);
  };

  const fetchTableDataInternal = (payload: IGetListDataPayload) => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      dispatch(fetchTableDataAction(payload));
      debouncedFetch(payload);
    }
  };

  const getColumnsUserSettings = (column: ITableColumn): ITableColumnUserSettings => {
    return {
      id: column.id,
      show: column.show,
      width: column.width,
    };
  };

  const saveUserSettings = (state: IDataTableStateContext) => {
    // don't save value if it's set to default, it helps to apply defaults
    const pageSize = state.selectedPageSize === initialPageSize ? null : state.selectedPageSize;

    const settings: IDataTableUserConfig = {
      pageSize: pageSize,
      currentPage: state.currentPage,
      quickSearch: state.quickSearch,
      columns: state.columns?.map(getColumnsUserSettings),
      tableSorting: state.userSorting,
      advancedFilter: state.tableFilter,
      selectedFilterIds: state.selectedStoredFilterIds,
    };

    setUserConfig(settings);
  };

  const fetchTableData = (providedState: IDataTableStateContext) => {
    // save user settings before fetch
    saveUserSettings(providedState);

    const payload = getFetchListDataPayload(providedState, repository);
    fetchTableDataInternal(payload);
  };

  const refreshTable = () => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      fetchTableData(state);
    }
  };

  // fetch table data when config is ready or something changed (selected filter, changed current page etc.)
  const fetchDataIfReady = () => {
    const groupingSupported = repository.supportsGrouping && repository.supportsGrouping({ sortMode: state.sortMode });
    const groupingIsReady = !groupingSupported || (grouping ?? []).length === (state.groupingColumns ?? []).length;
    const columnsAreReady = !(requireColumnRef.current) || (Boolean(state.configurableColumns) && state.columns.length === state.configurableColumns.length);
    const depsReady = isDataDependenciesReady();

    const readyToFetch = repository && groupingIsReady && columnsAreReady && depsReady;

    if (readyToFetch) {
      // fecth using entity type
      tableIsReady.current = true; // is used to prevent unneeded data fetch by the ReactTable. Any data fetch requests before this line should be skipped
      refreshTable();
    }
  };

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
    state.grouping,
    state.userSorting,
    state.permanentFilter,
    state.predefinedFilters,
    repository,
    state.groupingColumns,
    state.sortMode,
    state.strictSortBy,
    state.strictSortOrder,
  ]);

  const setColumnWidths = (widths: IColumnWidth[]) => {
    if (!userConfig)
      return;

    widths.forEach((wc) => {
      const userColumn = userConfig.columns.find((c) => c.id === wc.id);
      if (userColumn)
        userColumn.width = wc.width;
    });
    setUserConfig(userConfig);
  };

  const setCurrentPage = (val: number) => {
    dispatch(setCurrentPageAction(val));
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

  const removeColumnFilter = (columnId: string) => {
    dispatch(removeColumFilterAction(columnId));
  };

  const changeActionedRow = (val: any) => {
    dispatch(changeActionedRowAction(val));
  };

  const changeSelectedStoredFilterIds = (selectedFilterIds: string[]) => {
    dispatch(changeSelectedStoredFilterIdsAction(selectedFilterIds));
  };

  const setPredefinedFilters = (predefinedFilters: IStoredFilter[]) => {
    const filtersChanged = !isEqual(sortBy(state?.predefinedFilters), sortBy(predefinedFilters));

    // note: we should update the state is the table is not yet ready to trigger dependencies check
    if (filtersChanged || !tableIsReady.current) {
      dispatch(setPredefinedFiltersAction({ predefinedFilters, userConfig }));
    }
  };

  const changeSelectedIds = (selectedIds: string[]) => {
    dispatch(changeSelectedIdsAction(selectedIds));
  };

  const registerConfigurableColumns = (ownerId: string, configurableColumns: IConfigurableColumnsProps[]) => {
    dispatch((dispatchThunk, _getState) => {
      dispatchThunk(registerConfigurableColumnsAction({ ownerId, columns: configurableColumns }));

      repository.prepareColumns(configurableColumns).then((preparedColumns) => {
        // backgroundColor
        dispatchThunk(fetchColumnsSuccessSuccessAction({ configurableColumns, columns: preparedColumns, userConfig }));
      });
    });
  };

  const getCurrentFilter = (): ITableFilter[] => {
    return state.tableFilterDirty || state.tableFilter || [];
  };

  const onSort = (sorting: IColumnSorting[]) => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      dispatch(onSortAction(sorting));
    }
  };

  const onGroup = (grouping: ISortingItem[]) => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      dispatch(onGroupAction(grouping));
    }
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
    const payload = getFetchListDataPayload(state, repository);
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
          refreshTable,
        },
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
        refreshTable(); // TODO: return correct promise
        return Promise.resolve();
      },
    },
    [state, props.disableRefresh]
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

  const contextMetadata = useMemo<Promise<IObjectMetadata>>(() => Promise.resolve({
    typeDefinitionLoader: () => {
      return Promise.resolve({
        typeName: 'IDataTableContexApi',
        files: [{ content: dataTableContextCode, fileName: 'apis/dataTableContextApi.ts' }],
      });
    },
    properties: [],
    dataType: DataTypes.object,
  }), []);

  // TODO: pass row index
  const setRowData = (rowIndex: number, rowData: any) => {
    dispatch(setRowDataAction({ rowIndex, rowData: rowData }));
  };

  const getRepository = (): IRepository => repository;

  const setSelectedRow = (index: number, row: any) => {
    dispatch(setSelectedRowAction(state.selectedRow?.id !== row?.id ? { index, row, id: row?.id } : null));
  };

  const setDraggingState = (dragState: DragState) => {
    if (state.dragState !== dragState)
      dispatch(setDraggingRowAction(dragState));
  };

  const setMultiSelectedRow = (rows: Row[] | Row) => {
    dispatch(setMultiSelectedRowAction(rows));
  };

  const actions: IDataTableActionsContext = {
    onSort,
    onGroup,
    ...flagSetters,
    changeDisplayColumn,
    setCurrentPage,
    changePageSize,
    toggleColumnVisibility,
    toggleColumnFilter,
    removeColumnFilter,
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
    setPermanentFilter,
    changeSelectedIds,
    refreshTable,
    registerConfigurableColumns,
    getCurrentFilter,
    changePersistedFiltersToggle,
    getRepository,
    setRowData,
    setSelectedRow,
    setDragState: setDraggingState,
    setMultiSelectedRow,
    requireColumns,
    registerDataFetchDependency,
    unregisterDataFetchDependency,
    setColumnWidths,
  };

  /* Data Context section */

  const contextOnChangeData = (_, changedData: IDataTableStateContext) => {
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

    if (changedData.grouping !== undefined && !isEqual(changedData.grouping, state.grouping)) {
      onGroup(changedData.grouping);
      return;
    }
  };

  /* Data Context section */

  if (needToRegisterContext)
    return (
      <DataContextBinder
        id={'ctx_' + props.userConfigId}
        name={props.actionOwnerName}
        description={`Table context for ${props.actionOwnerName}`}
        type="control"
        data={state}
        api={actions}
        onChangeData={contextOnChangeData}
        metadata={contextMetadata}
      >
        <DataTableStateContext.Provider value={state}>
          <DataTableActionsContext.Provider value={actions}>
            {children}
          </DataTableActionsContext.Provider>
        </DataTableStateContext.Provider>
      </DataContextBinder>
    );

  return (
    <DataTableStateContext.Provider value={state}>
      <DataTableActionsContext.Provider value={actions}>
        {children}
      </DataTableActionsContext.Provider>
    </DataTableStateContext.Provider>
  );
};

type IDataTableProviderProps = IDataTableProviderBaseProps &
  IHasDataSourceType &
  (IHasFormDataSourceConfig | IUrlDataSourceConfig | IHasEntityDataSourceConfig) & {};
const getTableProviderComponent = (props: IDataTableProviderProps): FC<IDataTableProviderBaseProps> => {
  const { sourceType } = props;
  switch (sourceType) {
    case 'Entity': {
      return withBackendRepository(DataTableProviderWithRepository);
    }
    case 'Form': {
      return withFormFieldRepository(DataTableProviderWithRepository);
    };
    case 'Url':
      return withUrlRepository(DataTableProviderWithRepository);
    default: {
      return withNullRepository(DataTableProviderWithRepository, {});
    }
  }
};

const DataTableProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  const component = useMemo(() => {
    return getTableProviderComponent(props);
  }, [props.sourceType]);

  return (
    <DataTableWithMetadataProvider {...props}>
      {component(props)}
    </DataTableWithMetadataProvider>
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


/**
 * Define a dependency of the data fetching. Is used by the components which require some preparation logic before the data can be fetched by the DataTable context
 */
const useDataFetchDependency = (ownerId: string): DataFetchDependencyStateSwitcher => {
  const depState = useRef<DataFetchDependency>({ state: 'waiting' });
  const { registerDataFetchDependency, unregisterDataFetchDependency } = useDataTableStore();

  // dependency should be affected immediately
  registerDataFetchDependency(ownerId, depState.current);
  useEffect(() => {
    registerDataFetchDependency(ownerId, depState.current);

    return () => {
      unregisterDataFetchDependency(ownerId);
    };
  }, [ownerId]);

  // switcher is just a syntactical sugar
  const switcher: DataFetchDependencyStateSwitcher = {
    ready: () => {
      depState.current.state = 'ready';
    },
    waiting: () => {
      depState.current.state = 'waiting';
    },
  };
  return switcher;
};

export default DataTableProvider;
export { DataTableProvider, useDataTable, useDataTableActions, useDataTableState, useDataTableStore, useDataFetchDependency };
