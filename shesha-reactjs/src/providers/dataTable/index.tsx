import React, {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { advancedFilter2JsonLogic, getCurrentSorting, getTableDataColumns, getTableFormColumns } from './utils';
import { calculateDefaultColumns } from '@/designer-components/dataTable/table/utils';
import { dataTableReducer } from './reducer';
import { IHasModelType, IHasRepository, IRepository } from './repository/interfaces';
import { isEqual, sortBy } from 'lodash';
import { MetadataProvider, useMetadata } from '@/providers/metadata';
import { Row } from 'react-table';
import { IConfigurableActionConfiguration, useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useGlobalState } from '@/providers/globalState';
import { useDeepCompareMemo, useLocalStorage } from '@/hooks';
import { useThunkReducer } from '@/hooks/thunkReducer';
import { BackendDataSourceTable } from './repository/backendRepository';
import { FormDataSourceTable } from './repository/inMemoryRepository';
import { UrlDataSourceTable } from './repository/urlRepository';
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
  setContextValidationAction,
  toggleAdvancedFilterAction,
  toggleColumnsSelectorAction,
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
  DEFAULT_PAGE_SIZE,
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
  FilterExpression,
  ITableRowData,
} from './interfaces';
import {
  IConfigurableColumnsProps, IDataColumnsProps,
} from '../datatableColumnsConfigurator/models';
import DataContextBinder from '../dataContextProvider/dataContextBinder';
import { dataTableContextCode } from '@/publicJsApis';
import { DataTypes, IObjectMetadata } from '@/index';
import { IModelMetadata } from '@/interfaces/metadata';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { IModelValidation, throwError } from '@/utils/errors';
import { isDefined } from '@/utils/nullables';
import { ContextOnChangeData } from '../dataContextProvider/contexts';
import { isNonEmptyArray } from '@/utils/array';

interface IDataTableProviderBaseProps {
  /** Configurable columns. Is used in pair with entityType  */
  configurableColumns?: IConfigurableColumnsProps[] | undefined;

  /**
   * Used for storing the data table state in the global store and publishing and listening to events
   * If not provided, the state will not be saved globally and the user cannot listen to and publish events
   */
  actionOwnerId?: string | undefined;
  actionOwnerName?: string | undefined;

  defaultFilter?: IFilterItem[] | undefined;

  initialPageSize?: number | undefined;

  dataFetchingMode: DataFetchingMode;

  standardSorting?: ISortingItem[] | undefined;

  /** Id of the user config, is used for saving of the user settings (sorting, paging etc) to the local storage. */
  userConfigId?: string;

  grouping?: GroupingItem[] | undefined;
  sortMode?: SortMode | undefined;
  strictSortBy?: string | undefined;
  strictSortOrder?: ColumnSorting | undefined;
  allowReordering?: boolean | undefined;
  /**
   * Permanent filter exepression. Always applied irrespectively of other filters
   */
  permanentFilter?: FilterExpression | undefined;

  /**
   * Disable refresh data expression
   * Return 'true' if datatableContext is not ready to refresh data (filter data is not ready, etc...)
   */
  disableRefresh?: boolean | undefined;

  /**
   * Custom reorder endpoint
   */
  customReorderEndpoint?: string | undefined;

  needToRegisterContext?: boolean | undefined;
  /**
   * Action to execute before row reorder (allows validation and cancellation)
   */
  onBeforeRowReorder?: IConfigurableActionConfiguration | undefined;

  /**
   * Action to execute after row reorder (receives API response)
   */
  onAfterRowReorder?: IConfigurableActionConfiguration | undefined;

  /**
   * Validation result from parent DataContext component
   */
  contextValidation?: IModelValidation | undefined;
}

export type DataTableProviderWithUrlData = IDataTableProviderBaseProps & IHasEntityDataSourceConfig;

export interface IDataTableProviderWithRepositoryProps extends IDataTableProviderBaseProps, IHasRepository, IHasModelType { }

interface IHasDataSourceType {
  sourceType: 'Form' | 'Entity' | 'Url';
}
export interface IHasFormDataSourceConfig {
  propertyName: string;
  getFieldValue: (propertyName: string) => object[];
  metadata?: IModelMetadata;
  onChange: (...args: unknown[]) => void;
}
export interface IUrlDataSourceConfig {
  getDataPath?: string | undefined;
  getExportToExcelPath?: string;
}
export interface IHasEntityDataSourceConfig extends IUrlDataSourceConfig {
  /** Type of entity */
  entityType: string | IEntityTypeIdentifier;
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
    const advancedFilter = advancedFilter2JsonLogic(state.tableFilter, state.columns ?? []);
    if (advancedFilter && advancedFilter.length > 0) expressions = expressions.concat(advancedFilter);
  }

  if (expressions.length === 0) return "";

  const jsonLogicFilters = expressions.length === 1 ? expressions[0] : { and: expressions };

  return JSON.stringify(jsonLogicFilters);
};

const getFetchListDataPayload = (state: IDataTableStateContext, repository: IRepository): IGetListDataPayload => {
  const dataColumns = state.columns ? getTableDataColumns(state.columns) : [];

  const groupingSupported = repository.supportsGrouping ? repository.supportsGrouping({ sortMode: state.sortMode }) : false;

  if (dataColumns.length > 0 && groupingSupported && state.groupingColumns.length > 0) {
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

  if (state.columns)
    getTableFormColumns(state.columns).forEach((col) => dataColumns.push(col));

  const payload: IGetListDataPayload = {
    columns: dataColumns,
    pageSize: state.dataFetchingMode === 'paging' ? state.selectedPageSize ?? DEFAULT_PAGE_SIZE : -1,
    currentPage: state.dataFetchingMode === 'paging' ? state.currentPage ?? 1 : 1,
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

const sortingItems2ColumnSorting = (items: ISortingItem[] | undefined): IColumnSorting[] => {
  return items
    ? items.map<IColumnSorting>((item) => ({ id: item.propertyName, desc: item.sorting === 'desc' }))
    : [];
};

export const DataTableProviderWithRepository: FC<PropsWithChildren<IDataTableProviderWithRepositoryProps>> = (
  props,
) => {
  const {
    children,
    configurableColumns,
    actionOwnerId = "",
    actionOwnerName = "",
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
    onBeforeRowReorder,
    onAfterRowReorder,
    contextValidation,
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
    onBeforeRowReorder,
    onAfterRowReorder,
    contextValidation,
  });

  const metadata = useMetadata(false); // Don't require metadata - may not be in DataSource context

  // Track previous prop values to avoid unnecessary dispatches and loops
  const prevPropsRef = useRef({
    initialPageSize,
    permanentFilter,
    sortMode,
    strictSortBy,
    strictSortOrder,
    allowReordering,
    dataFetchingMode,
    modelType,
    sortingItems,
  });

  const changePageSize = useCallback((val: number): void => {
    dispatch(changePageSizeAction(val));
  }, [dispatch]);

  // Sync page size - only dispatch when prop actually changes, not state
  useEffect(() => {
    const prev = prevPropsRef.current.initialPageSize;
    if (initialPageSize !== prev && initialPageSize !== undefined) {
      prevPropsRef.current.initialPageSize = initialPageSize;
      changePageSize(initialPageSize);
    }
  }, [changePageSize, initialPageSize]);

  const setPermanentFilter = useCallback((filter: FilterExpression | undefined): void => {
    dispatch(setPermanentFilterAction({ filter }));
  }, [dispatch]);

  // Sync permanent filter - only dispatch when prop changes
  useEffect(() => {
    const prev = prevPropsRef.current.permanentFilter;
    if (!isEqual(permanentFilter, prev)) {
      prevPropsRef.current.permanentFilter = permanentFilter;
      setPermanentFilter(permanentFilter);
    }
  }, [permanentFilter, setPermanentFilter]);

  const { setState: setGlobalState } = useGlobalState();
  const tableIsReady = useRef(false);

  // Sync standard sorting - only when props change
  useDeepCompareEffect(() => {
    const prev = prevPropsRef.current.sortingItems;
    if (!isEqual(sortingItems, prev)) {
      prevPropsRef.current.sortingItems = sortingItems;
      const sorting = sortingItems2ColumnSorting(sortingItems);
      dispatch(setStandardSortingAction(sorting));
    }
  }, [sortingItems]);

  // Sync grouping - only when grouping prop or sortMode changes (don't watch state.grouping!)
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

      repository.prepareColumns(groupColumns)
        .then((preparedColumns) => {
          dispatch(fetchGroupingColumnsSuccessAction({ grouping, columns: preparedColumns }));
        })
        .catch((e) => {
          console.error('Failed to prepare grouping columns:', e);
          dispatch(fetchTableDataErrorAction({ error: e }));
        });
    }
  }, [grouping, sortMode]);

  // Sync ordering - only when props change
  useEffect(() => {
    const prev = prevPropsRef.current;
    const sortingChanged = sortMode !== prev.sortMode ||
      strictSortBy !== prev.strictSortBy ||
      strictSortOrder !== prev.strictSortOrder ||
      allowReordering !== prev.allowReordering;

    if (sortingChanged) {
      prevPropsRef.current.sortMode = sortMode;
      prevPropsRef.current.strictSortBy = strictSortBy;
      prevPropsRef.current.strictSortOrder = strictSortOrder;
      prevPropsRef.current.allowReordering = allowReordering;
      dispatch(setSortingSettingsAction({ sortMode, strictSortBy, strictSortOrder, allowReordering }));
    }
  }, [sortMode, strictSortBy, strictSortOrder, allowReordering, dispatch]);

  // Sync dataFetchingMode - only when prop changes
  useEffect(() => {
    const prev = prevPropsRef.current.dataFetchingMode;
    if (dataFetchingMode !== prev) {
      prevPropsRef.current.dataFetchingMode = dataFetchingMode;
      dispatch(setDataFetchingModeAction(dataFetchingMode));
    }
  }, [dataFetchingMode, dispatch]);

  const [userConfig, setUserConfig] = useLocalStorage<IDataTableUserConfig | undefined>(userConfigId ?? "", undefined);

  // Sync model type - only when prop changes
  useEffect(() => {
    const prev = prevPropsRef.current.modelType;
    if (modelType !== prev) {
      prevPropsRef.current.modelType = modelType;
      dispatch(setModelTypeAction(modelType));
    }
  }, [dispatch, modelType]);

  // Sync contextValidation - only when prop changes
  const prevContextValidationRef = useRef(contextValidation);
  useEffect(() => {
    const contextValidationChanged = !isEqual(prevContextValidationRef.current, contextValidation);
    if (contextValidationChanged) {
      prevContextValidationRef.current = contextValidation;
      dispatch(setContextValidationAction(contextValidation));
    }
  }, [contextValidation, dispatch]);

  const requireColumnRef = useRef<boolean>(false);
  const requireColumns = useCallback((): void => {
    requireColumnRef.current = true;
  }, []);

  const dataFetchDependencies = useRef<DataFetchDependencies>({});
  const registerDataFetchDependency = useCallback((ownerId: string, dependency: DataFetchDependency): void => {
    dataFetchDependencies.current[ownerId] = dependency;
  }, []);
  const unregisterDataFetchDependency = useCallback((ownerId: string): void => {
    delete dataFetchDependencies.current[ownerId];
  }, []);

  const isDataDependenciesReady = (): boolean => {
    const deps = dataFetchDependencies.current;
    for (const depName in deps) {
      if (deps.hasOwnProperty(depName) && deps[depName]?.state !== 'ready')
        return false;
    }
    return true;
  };

  const debouncedFetch = useDebouncedCallback(
    (payload: IGetListDataPayload) => {
      repository
        .fetch(payload)
        .then((response) => {
          dispatch(fetchTableDataSuccessAction(response));
        })
        .catch((e) => {
          console.error(e);
          dispatch(fetchTableDataErrorAction({ error: e }));
        });
    },
    // delay in ms
    300,
  );

  const fetchTableDataInternal = useCallback((payload: IGetListDataPayload): void => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      dispatch(fetchTableDataAction(payload));
      debouncedFetch(payload);
    }
  }, [debouncedFetch, dispatch, props.disableRefresh]);

  const saveUserSettings = useCallback((state: IDataTableStateContext): void => {
    // don't save value if it's set to default, it helps to apply defaults
    const pageSize = state.selectedPageSize === initialPageSize ? undefined : state.selectedPageSize;

    const columns: ITableColumnUserSettings[] = [];
    if (state.columns) {
      state.columns.forEach((column) => {
        if (column.id) {
          columns.push({
            id: column.id,
            show: column.show,
            width: column.width,
          });
        }
      });
    }

    const settings: IDataTableUserConfig = {
      pageSize: pageSize,
      currentPage: state.currentPage,
      quickSearch: state.quickSearch ?? "",
      columns: columns,
      tableSorting: state.userSorting ?? [],
      advancedFilter: state.tableFilter,
      selectedFilterIds: state.selectedStoredFilterIds,
    };

    setUserConfig(settings);
  }, [initialPageSize, setUserConfig]);

  const fetchDataPayload = useMemo(() => getFetchListDataPayload(state, repository), [repository, state]);
  const memoizedFetchDataPayload = useDeepCompareMemo(() => fetchDataPayload, [fetchDataPayload]);

  const fetchTableData = useCallback((fetchPayload: IGetListDataPayload): void => {
    // save user settings before fetch
    // saveUserSettings(fetchPayload);

    fetchTableDataInternal(fetchPayload);
  }, [fetchTableDataInternal]);

  const refreshTable = useCallback((): void => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      fetchTableData(memoizedFetchDataPayload);
    }
  }, [fetchTableData, props.disableRefresh, memoizedFetchDataPayload]);

  // fetch table data when config is ready or something changed (selected filter, changed current page etc.)
  useEffect(() => {
    const groupingSupported = repository.supportsGrouping && repository.supportsGrouping({ sortMode: state.sortMode });
    const groupingIsReady = !groupingSupported || (grouping ?? []).length === (state.groupingColumns).length;
    const columnsAreReady = !(requireColumnRef.current) || (isDefined(state.configurableColumns) && isDefined(state.columns) && state.columns.length === state.configurableColumns.length);
    const depsReady = isDataDependenciesReady();

    const readyToFetch = groupingIsReady && columnsAreReady && depsReady;

    if (readyToFetch) {
      // fecth using entity type
      tableIsReady.current = true; // is used to prevent unneeded data fetch by the ReactTable. Any data fetch requests before this line should be skipped
      refreshTable();
    }
  }, [state.tableFilter,
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
    state.modelType,
    state.configurableColumns,
    state.columns,
    grouping,
    refreshTable]);

  const setColumnWidths = useCallback((widths: IColumnWidth[]): void => {
    if (!isDefined(userConfig))
      return;

    widths.forEach((wc) => {
      const userColumn = userConfig.columns?.find((c) => c.id === wc.id);
      if (userColumn)
        userColumn.width = wc.width;
    });
    setUserConfig(userConfig);
  }, [setUserConfig, userConfig]);

  const setCurrentPage = useCallback((val: number): void => {
    dispatch(setCurrentPageAction(val));
  }, [dispatch]);

  const toggleColumnVisibility = useCallback((columnId: string): void => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(toggleColumnVisibilityAction(columnId));

      // note: column visibility doesn't trigger data fetching, so we should save user settings manually here
      saveUserSettings(getState());
    });
  }, [dispatch, saveUserSettings]);

  const changeFilterOption = useCallback((filterColumnId: string, filterOptionValue: IndexColumnFilterOption): void =>
    dispatch(changeFilterOptionAction({ filterColumnId, filterOptionValue })), [dispatch]);

  const changeFilter = useCallback((filterColumnId: string, filterValue: ColumnFilter): void =>
    dispatch(changeFilterAction({ filterColumnId, filterValue })), [dispatch]);

  const applyFilters = useCallback((): void => {
    dispatch((dispatchThunk, getState) => {
      const { tableFilterDirty } = getState();
      dispatchThunk(applyFilterAction(tableFilterDirty));
    });
  }, [dispatch]);

  /** change quick search text without refreshing of the table data */
  const changeQuickSearch = useCallback((val: string): void => {
    dispatch(changeQuickSearchAction(val));
  }, [dispatch]);

  /** change quick search and refresh table data */
  const performQuickSearch = useCallback((val: string): void => {
    // note: use thunk to get state after update
    dispatch((dispatchThunk/* , getState*/) => {
      dispatchThunk(changeQuickSearchAction(val));
      dispatchThunk(setCurrentPageAction(1));

      // const payload = getFetchListDataPayload(state, repository)
      // fetchTableData(getState());
    });
  }, [dispatch/* , fetchTableData*/]);

  const toggleSaveFilterModal = useCallback((visible: boolean): void => {
    dispatch(toggleSaveFilterModalAction(visible));
  }, [dispatch]);

  const clearFilters = useCallback((): void => {
    dispatch(toggleColumnFilterAction([]));
    dispatch(applyFilterAction([]));
  }, [dispatch]);

  const toggleColumnFilter = useCallback((ids: string[]): void => {
    if (isNonEmptyArray(ids)) {
      dispatch(toggleColumnFilterAction(ids));
    } else {
      clearFilters();
    }
  }, [clearFilters, dispatch]);

  const removeColumnFilter = useCallback((columnId: string): void => {
    dispatch(removeColumFilterAction(columnId));
  }, [dispatch]);

  const changeActionedRow = useCallback((val: ITableRowData): void => {
    dispatch(changeActionedRowAction(val));
  }, [dispatch]);

  const changeSelectedStoredFilterIds = useCallback((selectedFilterIds: string[]): void => {
    dispatch(changeSelectedStoredFilterIdsAction(selectedFilterIds));
  }, [dispatch]);

  const setPredefinedFilters = useCallback((predefinedFilters: IStoredFilter[]): void => {
    dispatch((dispatchThunk, getState) => {
      const currentState = getState();
      const filtersChanged = !isEqual(sortBy(currentState.predefinedFilters), sortBy(predefinedFilters));

      // note: we should update the state if the table is not yet ready to trigger dependencies check
      if (filtersChanged || !tableIsReady.current) {
        dispatchThunk(setPredefinedFiltersAction({ predefinedFilters, userConfig }));
      }
    });
  }, [dispatch, userConfig]);

  const changeSelectedIds = useCallback((selectedIds: string[]): void => {
    dispatch(changeSelectedIdsAction(selectedIds));
  }, [dispatch]);

  const registerConfigurableColumns = useCallback((ownerId: string, configurableColumns: IConfigurableColumnsProps[]): void => {
    dispatch(async (dispatchThunk, getState) => {
      let columnsToRegister = configurableColumns;
      const currentState = getState();

      // Generate default columns only when:
      // 1. DataTable has empty columns configuration (configurableColumns)
      // 2. DataContext state has no existing columns (first-time registration)
      // 3. Metadata is available from the DataContext entity
      // This ensures columns are generated only when DataTable first joins DataContext,
      // not when it's moved outside or re-registered
      if ((!isDefined(configurableColumns) || configurableColumns.length === 0) &&
        (!currentState.configurableColumns || currentState.configurableColumns.length === 0) &&
        metadata?.metadata) {
        try {
          const defaultColumns = await calculateDefaultColumns(metadata.metadata);
          if (defaultColumns.length > 0) {
            columnsToRegister = defaultColumns;
          }
        } catch (error) {
          console.warn('❌ Failed to generate default columns:', error);
          // Continue with empty columns if generation fails
        }
      }

      dispatchThunk(registerConfigurableColumnsAction({ ownerId, columns: columnsToRegister }));

      repository.prepareColumns(columnsToRegister)
        .then((preparedColumns) => {
          // backgroundColor
          dispatchThunk(fetchColumnsSuccessSuccessAction({ configurableColumns: columnsToRegister, columns: preparedColumns, userConfig }));
        })
        .catch((e) => {
          console.error('Failed to prepare table columns:', e);
          dispatch(fetchTableDataErrorAction({ error: e }));
        });
    });
  }, [dispatch, metadata, repository, userConfig]);

  const getCurrentFilter = useCallback((): ITableFilter[] => {
    return state.tableFilterDirty || state.tableFilter || [];
  }, [state]);

  const onSort = useCallback((sorting: IColumnSorting[]): void => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      dispatch(onSortAction(sorting));
    }
  }, [dispatch, props.disableRefresh]);

  const onGroup = useCallback((grouping: ISortingItem[]): void => {
    if (tableIsReady.current === true && !props.disableRefresh) {
      dispatch(onGroupAction(grouping));
    }
  }, [dispatch, props.disableRefresh]);

  //#region public

  const changeDisplayColumn = useCallback((displayColumnName: string): void => {
    dispatch(changeDisplayColumnAction(displayColumnName));
  }, [dispatch]);

  const changePersistedFiltersToggle = useCallback((persistSelectedFilters: boolean): void => {
    dispatch(changePersistedFiltersToggleAction(persistSelectedFilters));
  }, [dispatch]);

  const exportToExcel = (): Promise<void> => {
    const payload = getFetchListDataPayload(state, repository);
    return repository.exportToExcel(payload);
  };

  //#endregion

  //#region Subscriptions
  const getPartialState = (): Pick<IDataTableStateContext, 'actionedRow' | 'selectedIds' | 'selectedRow' | 'tableData'> => {
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
    [state, props.disableRefresh],
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
    [state],
  );

  useConfigurableAction(
    {
      name: 'Toggle Advanced Filter',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        // toggleAdvancedFilter(); TODO V1: restore
        return Promise.resolve();
      },
    },
    [state],
  );

  useConfigurableAction(
    {
      name: 'Toggle Columns Selector',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        // toggleColumnsSelector(); TODO V1: restore
        return Promise.resolve();
      },
    },
    [state],
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
  const setRowData = useCallback((rowIndex: number, rowData: ITableRowData): void => {
    dispatch(setRowDataAction({ rowIndex, rowData: rowData }));
  }, [dispatch]);

  const getRepository = useCallback((): IRepository => repository, [repository]);

  const setSelectedRow = useCallback((index: number, row: ITableRowData): void => {
    dispatch(setSelectedRowAction({ index, row, id: row.id }));
  }, [dispatch]);

  const setDraggingState = useCallback((dragState: DragState): void => {
    dispatch((dispatchThunk, getState) => {
      const currentState = getState();
      if (currentState.dragState !== dragState)
        dispatchThunk(setDraggingRowAction(dragState));
    });
  }, [dispatch]);

  const setMultiSelectedRow = useCallback((rows: Row<ITableRowData>[] | Row<ITableRowData>): void => {
    dispatch(setMultiSelectedRowAction(rows));
  }, [dispatch]);

  const toggleAdvancedFilter = useCallback((isVisible: boolean) => {
    dispatch(toggleAdvancedFilterAction(isVisible));
  }, [dispatch]);

  const toggleColumnsSelector = useCallback((isVisible: boolean) => {
    dispatch(toggleColumnsSelectorAction(isVisible));
  }, [dispatch]);

  const actions: IDataTableActionsContext = useMemo(() => ({
    toggleAdvancedFilter,
    toggleColumnsSelector,
    onSort,
    onGroup,
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
  }), [
    toggleAdvancedFilter,
    toggleColumnsSelector,
    onSort,
    onGroup,
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
    setDraggingState,
    setMultiSelectedRow,
    requireColumns,
    registerDataFetchDependency,
    unregisterDataFetchDependency,
    setColumnWidths,
  ]);

  /* Data Context section */

  const contextOnChangeData: ContextOnChangeData<IDataTableStateContext> = (_, changedData) => {
    if (!isDefined(changedData))
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
      <DataContextBinder<IDataTableStateContext>
        id={'ctx_' + props.userConfigId}
        name={actionOwnerName}
        description={`Table context for ${actionOwnerName}`}
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

type FormDataSourceTableProviderProps = IDataTableProviderBaseProps & IHasDataSourceType & IHasFormDataSourceConfig;
const isFormDataTable = (props: IDataTableProviderProps): props is FormDataSourceTableProviderProps => props.sourceType === 'Form';

type BackendDataSourceTableProviderProps = IDataTableProviderBaseProps & IHasDataSourceType & IHasEntityDataSourceConfig;
const isBackendDataTable = (props: IDataTableProviderProps): props is BackendDataSourceTableProviderProps => props.sourceType === 'Entity';

type UrlDataSourceTableProviderProps = IDataTableProviderBaseProps & IHasDataSourceType & IUrlDataSourceConfig;
const isUrlDataTable = (props: IDataTableProviderProps): props is UrlDataSourceTableProviderProps => props.sourceType === 'Url';

const DataTableProvider: FC<PropsWithChildren<IDataTableProviderProps>> = (props) => {
  return (
    <DataTableWithMetadataProvider {...props}>
      {isFormDataTable(props) && <FormDataSourceTable {...props} />}
      {isBackendDataTable(props) && <BackendDataSourceTable {...props} />}
      {isUrlDataTable(props) && <UrlDataSourceTable {...props} />}
    </DataTableWithMetadataProvider>
  );
};

const useDataTableStateOrUndefined = (): IDataTableStateContext | undefined => useContext(DataTableStateContext);
const useDataTableState = (): IDataTableStateContext => useDataTableStateOrUndefined() ?? throwError("useDataTableState must be used within a DataTableProvider");

const useDataTableActionsOrUndefined = (): IDataTableActionsContext | undefined => useContext(DataTableActionsContext);
const useDataTableActions = (): IDataTableActionsContext => useDataTableActionsOrUndefined() ?? throwError("useDataTableActions must be used within a DataTableProvider");

const useDataTableStoreOrUndefined = (): IDataTableStateContext & IDataTableActionsContext | undefined => {
  const actionsContext = useDataTableActionsOrUndefined();
  const stateContext = useDataTableStateOrUndefined();
  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};
const useDataTableStore = (): IDataTableStateContext & IDataTableActionsContext => useDataTableStoreOrUndefined() ?? throwError("useDataTableStore must be used within a DataTableProvider");

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
  }, [ownerId, registerDataFetchDependency, unregisterDataFetchDependency]);

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
export {
  DataTableProvider,
  useDataTableStateOrUndefined,
  useDataTableState,
  useDataTableActionsOrUndefined,
  useDataTableActions,
  useDataTableStoreOrUndefined,
  useDataTableStore,
  useDataFetchDependency,
};
