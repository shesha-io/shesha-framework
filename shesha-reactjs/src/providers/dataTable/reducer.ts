import { getFilterOptions } from '@/components/columnItemFilter';
import {
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  DEFAULT_PAGE_SIZE,
  IDataTableStateContext,
  ISelectionProps,
} from './contexts';
import {
  setSelectedRowAction,
  setDraggingRowAction,
  setMultiSelectedRowAction,
  setModelTypeAction,
  fetchTableDataAction,
  fetchTableDataSuccessAction,
  fetchTableDataErrorAction,
  setRowDataAction,
  fetchColumnsSuccessSuccessAction,
  changePageSizeAction,
  changeQuickSearchAction,
  toggleSaveFilterModalAction,
  setCurrentPageAction,
  toggleColumnVisibilityAction,
  toggleColumnFilterAction,
  removeColumFilterAction,
  changeFilterOptionAction,
  changeFilterAction,
  applyFilterAction,
  changeActionedRowAction,
  changeSelectedStoredFilterIdsAction,
  setPredefinedFiltersAction,
  setPermanentFilterAction,
  changeSelectedIdsAction,
  registerConfigurableColumnsAction,
  onSortAction,
  onGroupAction,
  changeDisplayColumnAction,
  changePersistedFiltersToggleAction,
  setDataFetchingModeAction,
  fetchGroupingColumnsSuccessAction,
  setSortingSettingsAction,
  setStandardSortingAction,
  setContextValidationAction,
  toggleAdvancedFilterAction,
  toggleColumnsSelectorAction,
} from './actions';
import {
  ITableColumn,
  ITableDataColumn,
  ITableFilter,
  ITableRowData,
} from './interfaces';
import { getTableDataColumn, prepareColumn } from './utils';
import { ProperyDataType } from '@/interfaces/metadata';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { createReducer } from '@reduxjs/toolkit';
import { isNonEmptyArray } from '@/utils/array';
import { getIdOrUndefined } from '@/utils/entity';

/** Type guard to check if an object has the required row data shape */
const isTableRowData = (obj: unknown): obj is ITableRowData => {
  return typeof obj === 'object' && obj !== null && 'id' in obj;
};

/** get dirty filter if exists and fallback to current filter state */
const getDirtyFilter = (state: IDataTableStateContext): ITableFilter[] => {
  return [...(state.tableFilterDirty || state.tableFilter || [])];
};

const getRowSelection = (rows: ITableRowData[], selectedId: string | undefined): ISelectionProps | undefined => {
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

const reducer = createReducer(DATA_TABLE_CONTEXT_INITIAL_STATE, (builder) => {
  builder
    .addCase(setSelectedRowAction, (state, { payload }) => {
      const selectedRow = payload && state.selectedRow?.id === payload.id
        ? undefined
        : payload;
      return { ...state, selectedRow };
    })
    .addCase(setDraggingRowAction, (state, { payload }) => {
      return {
        ...state,
        dragState: payload,
        selectedRow: undefined,
        selectedIds: undefined,
      };
    })
    .addCase(setMultiSelectedRowAction, (state, { payload }) => {
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
    })
    .addCase(setModelTypeAction, (state, { payload }) => {
      state.modelType = payload;
    })
    .addCase(fetchTableDataAction, (state, { payload }) => {
      state.isFetchingTableData = true;
      state.currentPage = payload.currentPage;
    })
    .addCase(fetchTableDataSuccessAction, (state, { payload }) => {
      const { rows, totalPages, totalRows, totalRowsBeforeFilter } = payload;

      const selectedRow = getRowSelection(rows as ITableRowData[], state.selectedRow?.id);

      return {
        ...state,
        tableData: rows,
        totalPages,
        totalRows,
        totalRowsBeforeFilter,
        isFetchingTableData: false,
        hasFetchTableDataError: false, // Clear error flag on success
        fetchTableDataError: undefined, // Clear error details on success
        selectedRow: selectedRow,
      };
    })
    .addCase(fetchTableDataErrorAction, (state, { payload }) => {
      return {
        ...state,
        isFetchingTableData: false,
        hasFetchTableDataError: true,
        fetchTableDataError: payload.error,
      };
    })
    .addCase(setRowDataAction, (state, { payload }) => {
      const { rowData, rowIndex } = payload;
      const { tableData } = state;

      const newData = [...tableData];
      newData.splice(rowIndex, 1, rowData);

      return {
        ...state,
        tableData: newData,
      };
    })
    .addCase(fetchColumnsSuccessSuccessAction, (state, { payload }) => {
      const { columns, configurableColumns, userConfig } = payload;

      const cols = configurableColumns
        .map<ITableColumn | undefined>((col) => prepareColumn(col, columns, userConfig))
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

      return {
        ...state,
        columns: cols,
        // user config
        currentPage: userConfig?.currentPage || 1,
        selectedPageSize: userConfig?.pageSize ?? state.selectedPageSize ?? DEFAULT_PAGE_SIZE,
        quickSearch: userConfig?.quickSearch,
        tableFilter: userConfig?.advancedFilter,
        tableFilterDirty: userConfig?.advancedFilter,
        selectedStoredFilterIds,
        userSorting: userSorting,
      };
    })
    .addCase(changePageSizeAction, (state, { payload }) => {
      state.selectedPageSize = payload;
    })
    .addCase(changeQuickSearchAction, (state, { payload }) => {
      state.quickSearch = payload;
    })
    .addCase(toggleSaveFilterModalAction, (state, { payload }) => {
      state.saveFilterModalVisible = payload;
    })
    .addCase(setCurrentPageAction, (state, { payload }) => {
      state.currentPage = payload;
    })
    .addCase(toggleColumnVisibilityAction, (state, { payload }) => {
      return {
        ...state,
        columns: state.columns
          ? state.columns.map(({ id, show, ...rest }) => {
            if (id === payload) {
              return {
                id,
                ...rest,
                show: !show,
              };
            }
            return { id, show, ...rest };
          })
          : [],
      };
    })
    .addCase(toggleColumnFilterAction, (state, { payload: appliedFiltersColumnIds }) => {
      const currentFilter = getDirtyFilter(state);
      const filter = appliedFiltersColumnIds.map<ITableFilter>((id) => {
        const existingFilter = currentFilter.find((f) => f.columnId === id);
        if (existingFilter) return existingFilter;

        const column = getTableDataColumn(state.columns ?? [], id);
        const filterOptions = column && !isNullOrWhiteSpace(column.dataType)
          ? getFilterOptions(column.dataType)
          : [];
        return {
          columnId: id,
          filterOption: filterOptions.length > 0 ? filterOptions[0] : undefined,
          filter: undefined,
        };
      });

      return {
        ...state,
        tableFilterDirty: filter,
      };
    })
    .addCase(removeColumFilterAction, (state, { payload: columnIdToRemove }) => {
      const currentFilter = getDirtyFilter(state);
      const filter = currentFilter.filter((f) => f.columnId !== columnIdToRemove);

      return {
        ...state,
        tableFilter: filter,
        tableFilterDirty: filter,
      };
    })
    .addCase(changeFilterOptionAction, (state, { payload }) => {
      const { filterColumnId, filterOptionValue } = payload;

      const currentFilter = getDirtyFilter(state);

      const filter = currentFilter.map<ITableFilter>((f) => ({
        ...f,
        filterOption: f.columnId === filterColumnId ? filterOptionValue : f.filterOption,
      }));

      return {
        ...state,
        tableFilterDirty: filter,
      };
    })
    .addCase(changeFilterAction, (state, { payload }) => {
      const { filterColumnId, filterValue } = payload;

      const currentFilter = getDirtyFilter(state);

      const filter = currentFilter.map<ITableFilter>((f) => ({
        ...f,
        filter: f.columnId === filterColumnId ? filterValue : f.filter,
      }));

      return {
        ...state,
        tableFilterDirty: filter,
      };
    })
    .addCase(applyFilterAction, (state, { payload }) => {
      return {
        ...state,
        tableFilter: payload,
        tableFilterDirty: payload,
        currentPage: 1,
      };
    })
    .addCase(changeActionedRowAction, (state, { payload }) => {
      return {
        ...state,
        actionedRow: payload,
      };
    })
    .addCase(changeSelectedStoredFilterIdsAction, (state, { payload }) => {
      return {
        ...state,
        selectedStoredFilterIds: payload,
      };
    })
    .addCase(setPredefinedFiltersAction, (state, { payload }) => {
      const { predefinedFilters, userConfig } = payload;

      const uc = userConfig?.selectedFilterIds?.filter((x) => {
        return predefinedFilters?.find((f) => {
          return f.id === x;
        });
      });

      const selectedStoredFilterIds = (!isDefined(state.selectedStoredFilterIds) || state.selectedStoredFilterIds.length === 0) && isNonEmptyArray(predefinedFilters)
        ? isNonEmptyArray(uc)
          ? uc
          : [predefinedFilters[0].id]
        : state.selectedStoredFilterIds;

      return {
        ...state,
        predefinedFilters,
        selectedStoredFilterIds,
      };
    })
    .addCase(setPermanentFilterAction, (state, { payload }) => {
      return {
        ...state,
        permanentFilter: payload.filter,
      };
    })
    .addCase(changeSelectedIdsAction, (state, { payload }) => {
      return {
        ...state,
        selectedIds: payload,
      };
    })
    .addCase(registerConfigurableColumnsAction, (state, { payload }) => {
      return {
        ...state,
        configurableColumns: [...payload.columns],
      };
    })
    .addCase(onSortAction, (state, { payload }) => {
      return {
        ...state,
        userSorting: [...payload],
      };
    })
    .addCase(onGroupAction, (state, { payload }) => {
      return {
        ...state,
        grouping: [...payload],
      };
    })
    .addCase(changeDisplayColumnAction, (state, { payload }) => {
      return {
        ...state,
        displayColumnName: payload,
      };
    })
    .addCase(changePersistedFiltersToggleAction, (state, { payload }) => {
      return {
        ...state,
        persistSelectedFilters: payload,
      };
    })
    .addCase(setDataFetchingModeAction, (state, { payload }) => {
      return {
        ...state,
        dataFetchingMode: payload,
      };
    })
    .addCase(fetchGroupingColumnsSuccessAction, (state, { payload }) => {
      const columns = payload.columns
        .map<ITableDataColumn>((column) => ({
          columnType: 'data',
          propertyName: column.propertyName ?? undefined,

          id: column.propertyName ?? undefined,
          accessor: column.propertyName ?? "",
          columnId: column.propertyName ?? undefined,

          header: column.caption ?? "",
          caption: column.caption ?? undefined,
          isVisible: true,
          show: true,
          isFilterable: false,
          isSortable: false,
          allowShowHide: false,

          dataType: column.dataType as ProperyDataType,
          dataFormat: column.dataFormat ?? undefined,
          entityTypeName: column.entityTypeName ?? undefined,
          entityTypeModule: column.entityTypeModule ?? undefined,
          referenceListName: column.referenceListName ?? undefined,
          referenceListModule: column.referenceListModule ?? undefined,
          allowInherited: column.allowInherited ?? undefined,
          metadata: column.metadata ?? undefined,
        }));

      return {
        ...state,
        groupingColumns: state.groupingColumns.length === 0 && columns.length === 0 ? state.groupingColumns : columns,
        grouping: payload.grouping,
      };
    })
    .addCase(setSortingSettingsAction, (state, { payload }) => {
      return {
        ...state,
        sortMode: payload.sortMode,
        strictSortBy: payload.strictSortBy,
        strictSortOrder: payload.strictSortOrder,
        allowReordering: payload.allowReordering,
      };
    })
    .addCase(setStandardSortingAction, (state, { payload }) => {
      return {
        ...state,
        standardSorting: [...payload],
      };
    })
    .addCase(setContextValidationAction, (state, { payload }) => {
      return {
        ...state,
        contextValidation: payload,
      };
    })
    .addCase(toggleAdvancedFilterAction, (state, { payload }) => {
      state.isAdvancedFilterVisible = payload;
      if (payload)
        state.isColumnsSelectorVisible = false;
    })
    .addCase(toggleColumnsSelectorAction, (state, { payload }) => {
      state.isColumnsSelectorVisible = payload;
      if (payload)
        state.isAdvancedFilterVisible = false;
    });
});

export { reducer as dataTableReducer };
