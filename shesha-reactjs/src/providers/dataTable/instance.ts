import { DatatableInitArgs, IDatasetInstance } from "./models";
import { Row } from "react-table";
import { IConfigurableColumnsProps, isActionColumnProps, isCrudOperationsColumnProps, isDataColumnProps, isFormColumnProps, isRendererColumnProps } from "../datatableColumnsConfigurator/models";
import { DataFetchDependencies, DatasetEvents, DataTableColumnDto, DragState, FilterExpression, IColumnWidth, IGetListDataPayload, ISelectionProps, isTableRowData, ITableActionColumn, ITableColumn, ITableDataColumn, ITableFormColumn, ITableRendererColumn } from "./interfaces";
import { IndexColumnFilterOption, ColumnFilter, ITableRowData, IStoredFilter, IColumnSorting, ISortingItem, ITableFilter, DataFetchDependency } from "./interfaces";
import { IRepository } from "./repository/interfaces";
import { IDataTableStateContext } from "./interfaces.state";
import { DATA_TABLE_CONTEXT_INITIAL_STATE, IDataTableUserConfig, ITableColumnUserSettings, MIN_COLUMN_WIDTH } from "./contexts";
import { IModelMetadata } from "@/interfaces";
import { isNonEmptyArray, undefinedIfEmptyArray } from "@/utils/array";
import { advancedFilter2JsonLogic, getCurrentSorting, getTableDataColumn, getTableDataColumns, getTableFormColumns, sortingItems2ColumnSorting } from "./utils";
import { extractErrorInfo } from "@/utils/errors";
import { SubscribeFunc, SubscriptionManager } from "@/utils/subscriptions/subscriptionManager";
import { isDefined, isNullOrWhiteSpace, undefinedIfNullOrWhiteSpace } from "@/utils/nullables";
import { camelcaseDotNotation } from "@/utils/string";
import { ProperyDataType } from "@/interfaces/metadata";
import { IAsyncStorage } from "@/configuration-studio/storage";
import { isEqual, sortBy } from 'lodash';
import { getFilterOptions } from "@/components/columnItemFilter";
import { getIdOrUndefined } from "@/utils/entity";

export type DataTableInstanceArgs = {
  repository: IRepository;
  logEnabled: boolean;
  storage: IAsyncStorage;
};

export class DatasetInstance implements IDatasetInstance {
  isInitialized: boolean = false;

  repository: IRepository;

  columns: IConfigurableColumnsProps[] = [];

  //#region config
  private userConfigId: string | undefined;

  private waitForColumnsBeforeFetch: boolean = false;

  private dataFetchDependencies: DataFetchDependencies = {};
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

  subscribe: SubscribeFunc<DatasetEvents, IDatasetInstance> = (type, callback) => {
    return this.#subscriptionManager.subscribe(type, callback);
  };

  state: IDataTableStateContext;

  initialPageSize: number = 10;

  init = async (args: DatatableInitArgs): Promise<void> => {
    this.log("Initializing datatable instance");
    this.#metadata = args.metadata;
    this.userConfigId = args.userConfigId;
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

    const userConfig = this.userConfigId
      ? await this.featchUserConfigAsync()
      : undefined;

    await this.initColumnsAsync(this.columns, userConfig);

    this.isInitialized = true;

    await this.fetchData();

    this.log("Initializing datatable instance - ok");
  };

  private prepareColumn = (column: IConfigurableColumnsProps, repoColOverrides: DataTableColumnDto[], userConfig: IDataTableUserConfig | undefined): ITableColumn | undefined => {
    const resolvedPropertyName = isDataColumnProps(column)
      ? (column.propertyName || column.accessor || column.id)
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
      minWidth: column.minWidth || MIN_COLUMN_WIDTH,
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

      const srvColumn = resolvedPropertyName
        ? repoColOverrides.find((c) => !isNullOrWhiteSpace(c.propertyName) && camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(resolvedPropertyName))
        : {};

      const dataCol: ITableDataColumn = {
        ...baseProps,
        id: resolvedPropertyName || column.id,
        accessor: resolvedPropertyName ? camelcaseDotNotation(resolvedPropertyName) : column.accessor ?? "",
        propertyName: resolvedPropertyName,

        propertiesToFetch: resolvedPropertyName,
        isEnitty: srvColumn?.dataType === 'entity',

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

  private initColumnsAsync = async (columns: IConfigurableColumnsProps[], userConfig: IDataTableUserConfig | undefined): Promise<void> => {
    const { state } = this;
    const repoColOverrides = await this.repository.prepareColumns(columns);

    const cols = columns
      .map<ITableColumn | undefined>((col) => this.prepareColumn(col, repoColOverrides, userConfig))
      .filter((c): c is ITableColumn => isDefined(c));

    const { predefinedFilters } = state;

    const userFilters = isDefined(userConfig) && isNonEmptyArray(userConfig.selectedFilterIds) && isNonEmptyArray(predefinedFilters)
      ? userConfig.selectedFilterIds.filter((x) => {
        return predefinedFilters.some((f) => {
          return f.id === x;
        });
      })
      : [];

    const selectedStoredFilterIds = state.selectedStoredFilterIds?.length
      ? [...state.selectedStoredFilterIds]
      : [...userFilters];

    if (selectedStoredFilterIds.length === 0 && isNonEmptyArray(predefinedFilters))
      selectedStoredFilterIds.push(predefinedFilters[0].id);

    const userSorting = isDefined(userConfig) && isNonEmptyArray(userConfig.tableSorting)
      ? userConfig.tableSorting
      : [];

    this.updateState(() => (
      {
        ...state,
        columns: cols,
        // user config
        currentPage: userConfig?.currentPage || 1,
        selectedPageSize: userConfig?.pageSize ?? state.selectedPageSize,
        quickSearch: userConfig?.quickSearch ?? "",
        tableFilter: userConfig?.advancedFilter ?? [],
        tableFilterDirty: userConfig?.advancedFilter,
        selectedStoredFilterIds,
        userSorting: userSorting,
      }
    ));
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

  fetchData = async (): Promise<void> => {
    this.log("fetchData");
    this.updateState((state) => ({ ...state, isFetchingTableData: true, fetchTableDataError: undefined }));
    try {
      this.saveUserConfigAsync();

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
    if (!selectedId || rows.length === 0)
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

    if (isNonEmptyArray(state.tableFilter)) {
      const advancedFilter = advancedFilter2JsonLogic(state.tableFilter, state.columns);
      if (advancedFilter && advancedFilter.length > 0) expressions = expressions.concat(advancedFilter);
    }

    if (expressions.length === 0) return "";

    const jsonLogicFilters = expressions.length === 1 ? expressions[0] : { and: expressions };

    return JSON.stringify(jsonLogicFilters);
  };

  toggleColumnVisibility = (columnId: string): void => {
    this.updateColumn(columnId, (column) => ({ ...column, isVisible: !column.isVisible }));
    this.saveUserConfigAsync();
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
    this.applyFilters();
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

    if (filtersChanged)
      this.updateState((state) => ({ ...state, predefinedFilters }));
  };

  setPermanentFilter = (filter: IStoredFilter): void => {
    this.updateState((state) => ({ ...state, permanentFilter: filter }));
  };

  onSort = async (sorting: IColumnSorting[]): Promise<void> => {
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
    return !isNullOrWhiteSpace(this.userConfigId)
      ? await this.#storage.getAsync<IDataTableUserConfig>(this.userConfigId)
      : undefined;
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

  registerConfigurableColumns = async (_ownerId: string, columns: IConfigurableColumnsProps[]): Promise<void> => {
    this.log("Register columns...");
    this.columns = columns;

    if (!this.isInitialized)
      return;

    const userConfig = this.userConfigId
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

  setMultiSelectedRow = (payload: Row<ITableRowData>[] | Row<ITableRowData>): void => {
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
