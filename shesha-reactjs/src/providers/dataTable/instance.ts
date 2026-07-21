/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { getFilterOptions } from "@/components/columnItemFilter";
import { IAsyncStorage } from "@/configuration-studio/storage";
import { IModelMetadata } from "@/interfaces";
import { ProperyDataType } from "@/interfaces/metadata";
import { isNonEmptyArray, undefinedIfEmptyArray } from "@/utils/array";
import { getIdOrUndefined } from "@/utils/entity";
import { extractErrorInfo } from "@/utils/errors";
import { isDefined, isNullOrWhiteSpace, undefinedIfNullOrWhiteSpace } from "@/utils/nullables";
import { jsonSafeParse } from "@/utils/object";
import { camelcaseDotNotation, firstNonEmptyStringOrUndefined } from "@/utils/string";
import { SubscribeFunc, SubscriptionManager } from "@/utils/subscriptions/subscriptionManager";
import { isEqual, sortBy } from 'lodash';
import { SortingRule } from "react-table";
import { IConfigurableColumnsProps, isActionColumnProps, isCrudOperationsColumnProps, isDataColumnProps, isFormColumnProps, isRendererColumnProps } from "../datatableColumnsConfigurator/models";
import { DATA_TABLE_CONTEXT_INITIAL_STATE, IDataTableUserConfig, ITableColumnUserSettings, MIN_COLUMN_WIDTH } from "./contexts";
import {
  ColumnFilter,
  DataFetchDependencies,
  DataFetchDependency,
  DatasetEvents, DataTableColumnDto,
  DragState, FilterExpression, IColumnWidth,
  IGetListDataPayload,
  IndexColumnFilterOption,
  ISelectionProps,
  ISortingItem,
  isTableRowData,
  IStoredFilter,
  ITableActionColumn, ITableColumn, ITableDataColumn,
  ITableFilter,
  ITableFormColumn, ITableRendererColumn,
  ITableRowData,
  JsonLogicFilter, RowSelection,
} from "./interfaces";
import { IDataTableStateContext } from "./interfaces.state";
import { DatatableInitArgs, IDatasetInstance } from "./models";
import { IRepository } from "./repository/interfaces";
import { advancedFilter2JsonLogic, getCurrentSorting, getTableDataColumn, getTableDataColumns, getTableFormColumns, sortingItems2ColumnSorting } from "./utils";

export type DataTableInstanceArgs = {
  repository: IRepository;
  logEnabled: boolean;
  storage: IAsyncStorage;
};

const filterExpression2Object = (filter: FilterExpression | undefined): JsonLogicFilter | undefined => {
  if (!isDefined(filter))
    return undefined;

  return typeof filter === 'string'
    ? !isNullOrWhiteSpace(filter)
      ? jsonSafeParse(filter)
      : undefined
    : filter;
};
const tryAddFilter = (filters: JsonLogicFilter[], filter: FilterExpression | undefined): void => {
  const converted = filterExpression2Object(filter);
  if (isDefined(converted))
    filters.push(converted);
};

export class DatasetInstance implements IDatasetInstance {
  isInitialized: boolean = false;

  repository: IRepository;

  columns: IConfigurableColumnsProps[] = [];

  //#region config
  private userConfigId: string | undefined;

  /** last fetched user config, is used to apply user's filter selection when predefined filters arrive after initialization */
  private userConfig: IDataTableUserConfig | undefined;

  private waitForColumnsBeforeFetch: boolean = false;

  private dataFetchDependencies: DataFetchDependencies = {};

  /** true when a fetch was skipped because some data fetch dependencies were not ready (e.g. dynamic filters are not evaluated yet) */
  private fetchSkippedDueToDependencies: boolean = false;
  //#endregion

  #storage: IAsyncStorage;

  #metadata: IModelMetadata | undefined;

  noop = (): void => {
    if (this.waitForColumnsBeforeFetch) {
      //
    }
    if (this.#metadata) {
      //
    }
  };

  #subscriptionManager: SubscriptionManager<DatasetEvents, IDatasetInstance>;

  constructor(args: DataTableInstanceArgs) {
    this.repository = args.repository;
    this.state = { ...DATA_TABLE_CONTEXT_INITIAL_STATE };
    this.#subscriptionManager = new SubscriptionManager<DatasetEvents, IDatasetInstance>();
    this.#storage = args.storage;

    // eslint-disable-next-line no-console
    this.log = args.logEnabled ? console.log : () => {};
  }

  updateRepository = (repository: IRepository): void => {
    this.repository = repository;
    if (repository.entityType !== this.state.modelType)
      this.updateState((prev) => ({ ...prev, modelType: repository.entityType }));
  };

  subscribe: SubscribeFunc<DatasetEvents, IDatasetInstance> = (type, callback) => {
    return this.#subscriptionManager.subscribe(type, callback);
  };

  state: IDataTableStateContext;

  initialPageSize: number = 10;

  init = async (args: DatatableInitArgs): Promise<void> => {
    this.log("Initializing datatable instance");
    this.#metadata = args.metadata;
    this.userConfigId = args.userConfigId;
    this.initialPageSize = args.initialPageSize ?? DATA_TABLE_CONTEXT_INITIAL_STATE.selectedPageSize;
    this.state.sortMode = args.sortMode; // TODO: make mandetory and split models
    this.state.dataFetchingMode = args.dataFetchingMode;
    this.state.selectedPageSize = args.initialPageSize ?? DATA_TABLE_CONTEXT_INITIAL_STATE.selectedPageSize;
    this.state.standardSorting = sortingItems2ColumnSorting(args.standardSorting);
    this.state.strictSortBy = args.strictSortBy;
    this.state.strictSortOrder = args.strictSortOrder;
    this.state.grouping = args.grouping;
    this.state.allowReordering = args.allowReordering ?? false;
    this.state.customReorderEndpoint = args.customReorderEndpoint;
    this.state.permanentFilter = args.permanentFilter;
    this.state.onBeforeRowReorder = args.onBeforeRowReorder;
    this.state.onAfterRowReorder = args.onAfterRowReorder;

    const userConfig = !isNullOrWhiteSpace(this.userConfigId)
      ? await this.featchUserConfigAsync()
      : undefined;

    // Snapshot the columns reference we're about to process so we can detect if
    // `registerConfigurableColumns` updates `this.columns` while we are awaiting.
    let processedColumns = this.columns;
    await this.initColumnsAsync(processedColumns, userConfig);

    while (this.columns !== processedColumns) {
      processedColumns = this.columns;
      await this.initColumnsAsync(processedColumns, userConfig);
    }

    this.isInitialized = true;

    await this.fetchData();

    this.log("Initializing datatable instance - ok");
  };

  private prepareColumn = (column: IConfigurableColumnsProps, repoColOverrides: DataTableColumnDto[], userConfig: IDataTableUserConfig | undefined): ITableColumn | undefined => {
    const resolvedPropertyName = isDataColumnProps(column)
      ? firstNonEmptyStringOrUndefined(column.propertyName, column.accessor, column.id)
      : undefined;
    const userColumnId = isDataColumnProps(column) ? resolvedPropertyName : column.id;
    const userColumn = userConfig?.columns?.find((c) => c.id === userColumnId);

    const baseProps: ITableColumn = {
      id: column.id,
      accessor: column.id,
      columnId: column.id,
      columnType: column.columnType,
      anchored: column.anchored,
      header: column.caption,
      caption: column.caption,
      minWidth: column.minWidth ?? MIN_COLUMN_WIDTH,
      maxWidth: column.maxWidth,
      width: userColumn?.width,
      isVisible: column.isVisible,
      show: column.isVisible,
      isFilterable: false,
      isSortable: false,
      allowShowHide: false,
      backgroundColor: column.backgroundColor,
      description: column.description,
    };

    if (isDataColumnProps(column)) {
      const colVisibility = userColumn && isDefined(userColumn.show) ? userColumn.show : column.isVisible;

      const srvColumn = !isNullOrWhiteSpace(resolvedPropertyName)
        ? repoColOverrides.find((c) => !isNullOrWhiteSpace(c.propertyName) && camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(resolvedPropertyName))
        : {};

      const dataCol: ITableDataColumn = {
        ...baseProps,
        id: !isNullOrWhiteSpace(resolvedPropertyName) ? resolvedPropertyName : column.id,
        accessor: !isNullOrWhiteSpace(resolvedPropertyName) ? camelcaseDotNotation(resolvedPropertyName) : column.accessor ?? "",
        propertyName: resolvedPropertyName,

        propertiesToFetch: resolvedPropertyName,
        isEntity: srvColumn?.dataType === 'entity',

        createComponent: column.createComponent,
        editComponent: column.editComponent,
        displayComponent: column.displayComponent,

        dataType: srvColumn?.dataType as ProperyDataType,
        dataFormat: srvColumn?.dataFormat ?? undefined,
        isSortable: column.allowSorting && Boolean(srvColumn?.isSortable),
        isFilterable: srvColumn?.isFilterable ?? false,
        entityTypeName: srvColumn?.entityTypeName ?? undefined,
        entityTypeModule: srvColumn?.entityTypeModule ?? undefined,
        referenceListName: srvColumn?.referenceListName ?? undefined,
        referenceListModule: srvColumn?.referenceListModule ?? undefined,
        allowInherited: srvColumn?.allowInherited ?? false,
        description: column.description,
        allowShowHide: true,
        show: colVisibility,
        metadata: srvColumn?.metadata ?? undefined,
      };
      return dataCol;
    }

    if (isActionColumnProps(column)) {
      const { icon, actionConfiguration } = column;

      const actionColumn: ITableActionColumn = {
        ...baseProps,
        icon,
        actionConfiguration,
      };

      return actionColumn;
    }

    if (isFormColumnProps(column)) {
      const formColumn: ITableFormColumn = {
        ...baseProps,
        accessor: '',
        propertiesToFetch: column.propertiesNames,
        propertiesNames: column.propertiesNames,

        displayFormId: column.displayFormId,
        createFormId: column.createFormId,
        editFormId: column.editFormId,

        minHeight: column.minHeight,
      };
      return formColumn;
    }

    if (isRendererColumnProps(column)) {
      const rendererColumn: ITableRendererColumn = {
        ...baseProps,
        renderCell: column.renderCell,
      };
      return rendererColumn;
    }

    if (isCrudOperationsColumnProps(column)) {
      return {
        ...baseProps,
      };
    }

    return undefined;
  };

  /** monotonic counter used to skip outdated columns initializations (see `initColumnsAsync`) */
  #columnsInitVersion: number = 0;

  private initColumnsAsync = async (columns: IConfigurableColumnsProps[], userConfig: IDataTableUserConfig | undefined): Promise<void> => {
    const initVersion = ++this.#columnsInitVersion;
    const repoColOverrides = await this.repository.prepareColumns(columns);

    // skip outdated initialization: a newer one was started while `prepareColumns` was awaited,
    // applying this one may bring back an outdated set of columns
    if (initVersion !== this.#columnsInitVersion)
      return;

    const cols = columns
      .map<ITableColumn | undefined>((col) => this.prepareColumn(col, repoColOverrides, userConfig))
      .filter((c): c is ITableColumn => isDefined(c));

    // note: use the updater form of state to not lose changes made while `prepareColumns` was awaited (e.g. predefined filters)
    this.updateState((state) => {
      const { predefinedFilters } = state;

      const userFilters = isDefined(userConfig) && isNonEmptyArray(userConfig.selectedFilterIds) && isNonEmptyArray(predefinedFilters)
        ? userConfig.selectedFilterIds.filter((x) => {
          return predefinedFilters.some((f) => {
            return f.id === x;
          });
        })
        : [];

      const selectedStoredFilterIds = isNonEmptyArray(state.selectedStoredFilterIds)
        ? [...state.selectedStoredFilterIds]
        : [...userFilters];

      if (selectedStoredFilterIds.length === 0 && isNonEmptyArray(predefinedFilters))
        selectedStoredFilterIds.push(predefinedFilters[0].id);

      const userSorting = isDefined(userConfig) && isNonEmptyArray(userConfig.tableSorting)
        ? userConfig.tableSorting
        : [];

      return {
        ...state,
        columns: cols,
        // user config
        currentPage: userConfig?.currentPage ?? 1,
        selectedPageSize: userConfig?.pageSize ?? state.selectedPageSize,
        quickSearch: userConfig?.quickSearch ?? "",
        tableFilter: userConfig?.advancedFilter ?? [],
        tableFilterDirty: userConfig?.advancedFilter,
        selectedStoredFilterIds,
        userSorting: userSorting,
      };
    });
  };

  private updateState = (updater: (state: IDataTableStateContext) => IDataTableStateContext): void => {
    const stateBeforeUpdate = this.state;
    this.state = updater(this.state);
    if (stateBeforeUpdate === this.state)
      return;
    this.notifySubscribers(['data']);
  };

  private updateColumn = (id: string, updater: (column: ITableColumn) => ITableColumn): void => {
    this.updateState((prev) => {
      const newColumns = prev.columns.map((column) => column.id === id ? updater(column) : column);
      return { ...prev, columns: newColumns };
    });
  };

  generateColumns = (): void => {
    this.log("generateColumns");
    throw new Error('Method generateColumns Not implemented');
  };

  notifySubscribers = (types: DatasetEvents[]): void => this.#subscriptionManager.notifySubscribers(types, this);

  private isDataDependenciesReady = (): boolean => {
    return Object.values(this.dataFetchDependencies).every((dep) => dep.state === 'ready');
  };

  fetchData = async (): Promise<void> => {
    this.log("fetchData");

    // the host component requires columns loading (see `requireColumns`), skip fetching until the columns
    // are registered, `registerConfigurableColumns` triggers a fetch after registration
    if (this.waitForColumnsBeforeFetch && !this.#columnsRegistered) {
      this.log("fetchData skipped: columns are not registered yet");
      return;
    }

    // Components (e.g. TableViewSelector) may require preparation logic (e.g. evaluation of dynamic filters)
    // before the data can be fetched. Skip fetching until all dependencies are ready, the fetch
    // is re-triggered when the dependency owner pushes its data (see `setPredefinedFilters`)
    if (!this.isDataDependenciesReady()) {
      this.fetchSkippedDueToDependencies = true;
      this.log("fetchData skipped: data fetch dependencies are not ready");
      return;
    }
    this.fetchSkippedDueToDependencies = false;

    this.updateState((state) => ({ ...state, isFetchingTableData: true, fetchTableDataError: undefined }));
    try {
      await this.saveUserConfigAsync();

      const payload = this.getFetchListDataPayload();
      const data = await this.repository.fetch(payload);

      // TODO: if current page is not available after change of the page size - reset page number to 1

      const { rows, totalPages, totalRows, totalRowsBeforeFilter } = data;

      const selectedRow = this.getRowSelection(rows, this.state.selectedRow?.id);

      this.updateState((state) => ({
        ...state,
        tableData: rows,
        totalPages,
        totalRows,
        totalRowsBeforeFilter,
        isFetchingTableData: false,
        hasFetchTableDataError: false, // Clear error flag on success
        fetchTableDataError: undefined, // Clear error details on success
        selectedRow: selectedRow,
      }));
    } catch (error) {
      this.updateState((state) => ({ ...state, isFetchingTableData: false, fetchTableDataError: extractErrorInfo(error) }));
    }
  };

  private getRowSelection = (rows: ITableRowData[], selectedId: string | undefined): ISelectionProps | undefined => {
    if (isNullOrWhiteSpace(selectedId) || rows.length === 0)
      return undefined;

    const rowIndex = rows.findIndex((row) => row.id === selectedId);
    const row = rows[rowIndex];
    return row
      ? {
        row: row,
        id: selectedId,
        index: rowIndex,
      }
      : undefined;
  };

  private getFetchListDataPayload = (): IGetListDataPayload => {
    const { state, repository } = this;
    const dataColumns = isNonEmptyArray(state.columns)
      ? getTableDataColumns(state.columns)
      : [];

    const groupingSupported = repository.supportsGrouping ? repository.supportsGrouping({ sortMode: state.sortMode }) : false;

    if (dataColumns.length > 0 && groupingSupported && state.groupingColumns.length > 0) {
      state.groupingColumns.forEach((groupColumn) => {
        if (!dataColumns.find((column) => column.propertyName === groupColumn.propertyName)) {
          dataColumns.push(groupColumn);
        }
      });
    }
    const filter = this.getFilter(state);

    if (state.sortMode === 'strict' && !isNullOrWhiteSpace(state.strictSortBy)) {
      if (!dataColumns.find((column) => column.propertyName === state.strictSortBy))
        dataColumns.push({
          id: state.strictSortBy,
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

    if (isNonEmptyArray(state.columns))
      getTableFormColumns(state.columns).forEach((col) => dataColumns.push(col));

    const payload: IGetListDataPayload = {
      columns: dataColumns,
      pageSize: state.dataFetchingMode === 'paging' ? state.selectedPageSize : -1,
      currentPage: state.dataFetchingMode === 'paging' ? state.currentPage : 1,
      sorting: undefinedIfEmptyArray(getCurrentSorting(state, groupingSupported)),
      quickSearch: undefinedIfNullOrWhiteSpace(state.quickSearch),
      filter: undefinedIfNullOrWhiteSpace(filter),
    };
    return payload;
  };

  private getFilter = (state: IDataTableStateContext): string => {
    const allFilters = state.predefinedFilters ?? [];

    const filters = allFilters.filter((f) => (isNonEmptyArray(state.selectedStoredFilterIds) && state.selectedStoredFilterIds.indexOf(f.id) > -1));
    const { permanentFilter } = state;

    const expressions: JsonLogicFilter[] = [];
    filters.forEach((f) => {
      tryAddFilter(expressions, f.expression);
    });
    // add permanent filter if specified
    tryAddFilter(expressions, permanentFilter);

    if (isNonEmptyArray(state.tableFilter)) {
      const advancedFilter = advancedFilter2JsonLogic(state.tableFilter, state.columns);
      if (isNonEmptyArray(advancedFilter))
        expressions.push(...advancedFilter);
    }

    if (expressions.length === 0) return "";

    const jsonLogicFilters = expressions.length === 1 ? expressions[0] : { and: expressions };

    return JSON.stringify(jsonLogicFilters);
  };

  toggleColumnVisibility = (columnId: string): void => {
    this.updateColumn(columnId, (column) => ({ ...column, isVisible: !column.isVisible }));
    void this.saveUserConfigAsync();
  };

  setCurrentPage = async (pageNo: number): Promise<void> => {
    if (pageNo === this.state.currentPage)
      return;

    this.updateState((state) => ({ ...state, currentPage: pageNo }));
    await this.fetchData();
  };

  changePageSize = async (pageSize: number): Promise<void> => {
    if (pageSize === this.state.selectedPageSize)
      return;

    this.updateState((state) => ({ ...state, selectedPageSize: pageSize }));
    await this.fetchData();
  };

  private getDirtyFilter = (): ITableFilter[] => {
    return [...(this.state.tableFilterDirty ?? this.state.tableFilter)];
  };

  private toggleDirtyFilter = (columnIds: string[]): void => {
    if (isNonEmptyArray(columnIds)) {
      const currentFilter = this.getDirtyFilter();
      const filter = columnIds.map<ITableFilter>((id) => {
        const existingFilter = currentFilter.find((f) => f.columnId === id);
        if (existingFilter) return existingFilter;

        const column = getTableDataColumn(this.state.columns, id);
        const filterOptions = column && !isNullOrWhiteSpace(column.dataType)
          ? getFilterOptions(column.dataType)
          : [];
        return {
          columnId: id,
          filterOption: filterOptions.length > 0 ? filterOptions[0] : undefined,
          filter: undefined,
        };
      });

      this.updateState((state) => ({ ...state, tableFilterDirty: filter }));
    } else {
      this.updateState((state) => ({ ...state, tableFilterDirty: [] }));
    }
  };

  private updateDirtyFilter = (filterColumnId: string, updater: (filter: ITableFilter) => ITableFilter): void => {
    const currentFilter = this.getDirtyFilter();
    const filter = currentFilter.map<ITableFilter>((filter) => (filter.columnId === filterColumnId ? updater(filter) : filter));
    this.updateState((state) => ({ ...state, tableFilterDirty: filter }));
  };

  toggleColumnFilter = (columnIds: string[]): void => {
    this.toggleDirtyFilter(columnIds);
  };

  removeColumnFilter = async (columnId: string): Promise<void> => {
    const currentFilter = this.getDirtyFilter();
    const filter = currentFilter.filter((f) => f.columnId !== columnId);
    this.updateState((state) => ({ ...state, tableFilterDirty: filter, tableFilter: filter }));
    await this.fetchData();
  };

  changeFilterOption = (filterColumnId: string, filterOptionValue: IndexColumnFilterOption): void => {
    this.updateDirtyFilter(filterColumnId, (f) => ({ ...f, filterOption: filterOptionValue }));
  };

  changeFilter = (_filterColumnId: string, filterValue: ColumnFilter): void => {
    this.updateDirtyFilter(_filterColumnId, (f) => ({ ...f, filter: filterValue }));
  };

  applyFilters = async (): Promise<void> => {
    const dirtyFilter = this.getDirtyFilter();
    this.updateState((state) => ({ ...state, tableFilter: dirtyFilter, currentPage: 1 }));
    await this.fetchData();
  };

  clearFilters = (): void => {
    this.toggleColumnFilter([]);
    void this.applyFilters();
  };

  changeQuickSearch = (value: string): void => {
    this.updateState((state) => ({ ...state, quickSearch: value }));
  };

  performQuickSearch = async (value: string): Promise<void> => {
    this.updateState((state) => ({ ...state, quickSearch: value, currentPage: 1 }));
    await this.fetchData();
  };

  changeActionedRow = (data: ITableRowData): void => {
    this.updateState((state) => ({ ...state, actionedRow: data }));
  };

  changeSelectedStoredFilterIds = async (selectedStoredFilterIds: string[]): Promise<void> => {
    this.updateState((state) => ({ ...state, selectedStoredFilterIds: selectedStoredFilterIds }));
    await this.fetchData();
  };

  setPredefinedFilters = (predefinedFilters: IStoredFilter[]): void => {
    const { state } = this;
    const filtersChanged = !isEqual(sortBy(state.predefinedFilters), sortBy(predefinedFilters));

    if (filtersChanged) {
      // filters may arrive after initialization (e.g. when dynamic filters are evaluated using async form data),
      // in this case the default filter selection must be applied here, the same way as `initColumnsAsync` does it
      const currentSelectedIds = state.selectedStoredFilterIds ?? [];
      let selectedStoredFilterIds = currentSelectedIds;
      if (currentSelectedIds.length === 0 && isNonEmptyArray(predefinedFilters)) {
        const userFilters = this.userConfig?.selectedFilterIds?.filter((id) => predefinedFilters.some((f) => f.id === id)) ?? [];
        selectedStoredFilterIds = userFilters.length > 0 ? [...userFilters] : [predefinedFilters[0].id];
      }

      this.updateState((state) => ({ ...state, predefinedFilters, selectedStoredFilterIds }));
    }

    // refetch when the filters were changed or a previous fetch was skipped because filters were not evaluated yet
    if (this.isInitialized && (filtersChanged || this.fetchSkippedDueToDependencies))
      void this.fetchData();
  };

  setPermanentFilter = (filter: FilterExpression | undefined): void => {
    const filterChanged = !isEqual(this.state.permanentFilter, filter);
    if (!filterChanged)
      return;

    this.updateState((state) => ({ ...state, permanentFilter: filter }));
    if (this.isInitialized)
      void this.fetchData();
  };

  onSort = async (sorting: SortingRule<ITableRowData>[]): Promise<void> => {
    this.updateState((state) => ({ ...state, userSorting: [...sorting] }));
    // TODO: review old condition
    // if (tableIsReady.current === true && !props.disableRefresh) {
    await this.fetchData();
  };

  onGroup = async (grouping: ISortingItem[]): Promise<void> => {
    this.updateState((state) => ({ ...state, grouping: [...grouping] }));
    // TODO: review old condition
    // if (tableIsReady.current === true && !props.disableRefresh) {
    await this.fetchData();
  };

  changeSelectedIds = (selectedIds: string[]): void => {
    this.updateState((state) => ({ ...state, selectedIds: selectedIds }));
  };

  getCurrentFilter = (): ITableFilter[] => {
    const { state } = this;
    return state.tableFilterDirty ?? state.tableFilter;
  };

  toggleAdvancedFilter = (isVisible?: boolean | undefined): void => {
    this.log('toggleAdvancedFilter', isVisible);
    this.updateState((state) => {
      const newVisible = isVisible ?? !state.isAdvancedFilterVisible;
      return {
        ...state,
        isAdvancedFilterVisible: newVisible,
        isColumnsSelectorVisible: false,
      };
    });
  };

  toggleColumnsSelector = (isVisible?: boolean | undefined): void => {
    this.updateState((state) => {
      const newVisible = isVisible ?? !state.isColumnsSelectorVisible;
      return {
        ...state,
        isColumnsSelectorVisible: newVisible,
        isAdvancedFilterVisible: false,
      };
    });
  };

  private featchUserConfigAsync = async (): Promise<IDataTableUserConfig | undefined> => {
    this.userConfig = !isNullOrWhiteSpace(this.userConfigId)
      ? await this.#storage.getAsync<IDataTableUserConfig>(this.userConfigId)
      : undefined;
    return this.userConfig;
  };

  private saveUserConfigAsync = async (updater?: (userConfig: IDataTableUserConfig) => void): Promise<void> => {
    const { state, initialPageSize, userConfigId } = this;
    if (isNullOrWhiteSpace(userConfigId))
      return;

    // don't save value if it's set to default, it helps to apply defaults
    const pageSize = state.selectedPageSize === initialPageSize ? undefined : state.selectedPageSize;

    const columns: ITableColumnUserSettings[] = [];
    if (isNonEmptyArray(state.columns)) {
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

    const userConfig: IDataTableUserConfig = {
      pageSize: pageSize,
      currentPage: state.currentPage,
      quickSearch: state.quickSearch,
      columns: columns,
      tableSorting: state.userSorting ?? [],
      advancedFilter: state.tableFilter,
      selectedFilterIds: state.selectedStoredFilterIds,
    };

    updater?.(userConfig);

    await this.#storage.setAsync(userConfigId, userConfig);
  };

  /** true when configurable columns were registered at least once (see `requireColumns` and `fetchData`) */
  #columnsRegistered: boolean = false;

  registerConfigurableColumns = async (_ownerId: string, columns: IConfigurableColumnsProps[]): Promise<void> => {
    this.log("Register columns...");
    this.columns = columns;
    this.#columnsRegistered = true;

    if (!this.isInitialized)
      return;

    const userConfig = !isNullOrWhiteSpace(this.userConfigId)
      ? await this.featchUserConfigAsync()
      : undefined;

    await this.initColumnsAsync(this.columns, userConfig);

    await this.fetchData();

    this.log("Register columns - ok");
  };

  requireColumns = (): void => {
    this.log("requireColumns...");
    this.waitForColumnsBeforeFetch = true;
  };

  registerDataFetchDependency = (ownerId: string, dependency: DataFetchDependency): void => {
    this.dataFetchDependencies[ownerId] = dependency;
  };

  unregisterDataFetchDependency = (ownerId: string): void => {
    delete this.dataFetchDependencies[ownerId];
  };

  getRepository = (): IRepository => {
    return this.repository;
  };

  setRowData = (rowIndex: number, rowData: ITableRowData): void => {
    this.updateState((state) => {
      const { tableData } = state;

      const newData = [...tableData];
      newData.splice(rowIndex, 1, rowData);

      return {
        ...state,
        tableData: newData,
      };
    });
  };

  setSelectedRow = (index: number, row: ITableRowData): void => {
    this.updateState((state) => {
      const rowId = row.id;
      const selectedRow = state.selectedRow && state.selectedRow.id === rowId
        ? undefined
        : {
          index: index,
          id: rowId,
          row: row,
        };
      return {
        ...state,
        selectedRow: selectedRow,
      };
    });
  };

  clearSelectedRow = (): void => {
    this.updateState((state) => {
      return {
        ...state,
        selectedRow: undefined,
      };
    });
  };

  setDragState = (dragState: DragState): void => {
    this.updateState((state) => {
      return state.dragState === dragState
        ? state
        : {
          ...state,
          dragState: dragState,
          selectedRow: undefined,
          selectedIds: [],
        };
    });
  };

  setMultiSelectedRow = (payload: RowSelection<ITableRowData>[] | RowSelection<ITableRowData>): void => {
    this.updateState((state) => {
      const { selectedRows: rows = [] } = state; // Ensure rows is always an array
      let selectedRows: ITableRowData[];

      if (Array.isArray(payload)) {
        selectedRows = payload.filter(({ isSelected }) => isSelected).map(({ original }) => original);
      } else {
        // Type-safe extraction with runtime validation
        if (!isTableRowData(payload.original)) {
          console.warn('SetMultiSelectedRow: Invalid row data shape', { payload });
          return state;
        }

        const data = payload.original;
        const rowId = data.id;
        const isSelected = payload.isSelected;

        if (!rowId) {
          console.warn('SetMultiSelectedRow: Row ID is missing', { payload, data });
          return state;
        }

        // Check if row exists in selectedRows using strict equality
        const exists = rows.some((row) => getIdOrUndefined(row) === rowId);

        if (exists && isSelected) {
          // Row exists and should be selected - replace it with updated data
          selectedRows = [...rows.filter((row) => getIdOrUndefined(row) !== rowId), data];
        } else if (exists && !isSelected) {
          // Row exists and should be deselected - remove it
          selectedRows = rows.filter((row) => getIdOrUndefined(row) !== rowId);
        } else if (!exists && isSelected) {
          // Row doesn't exist and should be selected - add it
          selectedRows = [...rows, data];
        } else {
          // Row doesn't exist and should be deselected - no change
          selectedRows = rows;
        }
      }

      return {
        ...state,
        selectedRows,
      };
    });
  };

  setColumnWidths = async (widths: IColumnWidth[]): Promise<void> => {
    await this.saveUserConfigAsync((userConfig) => {
      if (isDefined(userConfig.columns)) {
        widths.forEach((wc) => {
          const userColumn = userConfig.columns?.find((c) => c.id === wc.id);
          if (userColumn)
            userColumn.width = wc.width;
        });
      }
    });
  };

  refreshTable = async (): Promise<void> => {
    await this.fetchData();
  };

  exportToExcel = (): Promise<void> => {
    const payload = this.getFetchListDataPayload();
    return this.repository.exportToExcel(payload);
  };

  private log = (..._args: unknown[]): void => {
    // noop
  };
}
