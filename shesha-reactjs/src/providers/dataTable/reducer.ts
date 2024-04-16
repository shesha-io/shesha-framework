import { handleActions } from 'redux-actions';
import { getFilterOptions } from '@/components/columnItemFilter';
import flagsReducer from '../utils/flagsReducer';
import {
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DragState,
  IDataTableStateContext,
  ISelectionProps,
} from './contexts';
import {
  DataTableActionEnums,
  IChangeFilterAction,
  IChangeFilterOptionPayload,
  IFetchColumnsSuccessSuccessPayload,
  IFetchGroupingColumnsSuccessPayload,
  IRegisterConfigurableColumnsPayload,
  ISetPermanentFilterActionPayload,
  ISetPredefinedFiltersPayload,
  ISetRowDataPayload,
  ISortingSettingsActionPayload,
} from './actions';
import {
  DataFetchingMode,
  IColumnSorting,
  IGetListDataPayload,
  ISortingItem,
  ITableColumn,
  ITableDataColumn,
  ITableDataInternalResponse,
  ITableFilter,
} from './interfaces';
import { getTableDataColumn, prepareColumn } from './utils';
import { Row } from 'react-table';
import { ProperyDataType } from '@/interfaces/metadata';

/** get dirty filter if exists and fallback to current filter state */
const getDirtyFilter = (state: IDataTableStateContext): ITableFilter[] => {
  return [...(state.tableFilterDirty || state.tableFilter || [])];
};

const reducer = handleActions<IDataTableStateContext, any>(
  {
    /** Table Selection */

    [DataTableActionEnums.SetSelectedRow]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ISelectionProps>
    ) => {
      const { payload } = action;
      const selectedRow = state?.selectedRow?.id === payload?.id ? null : payload;
      return { ...state, selectedRow };
    },

    [DataTableActionEnums.SetHoverRow]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;
      return {
        ...state,
        hoverRowId: payload,
      };
    },

    [DataTableActionEnums.SetDraggingState]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<DragState>
    ) => {
      const { payload } = action;
      return {
        ...state,
        dragState: payload,
        selectedRow: null,
        selectedIds: null,
      };
    },

    [DataTableActionEnums.SetMultiSelectedRow]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<Row[] | Row>
    ) => {
      const { payload } = action;
      const { selectedRows: rows } = state;
      let selectedRows;

      if (Array.isArray(payload)) {
        selectedRows = payload?.filter(({ isSelected }) => isSelected).map(({ original }) => original);
      } else {
        const data = payload.original as any;
        const exists = rows.some(({ id }) => id === data?.id);
        const isSelected = payload.isSelected;

        if (exists && isSelected) {
          selectedRows = [...rows.filter(({ id }) => id !== data?.id), data];
        } else if (exists && !isSelected) {
          selectedRows = rows.filter(({ id }) => id !== data?.id);
        } else if (!exists && isSelected) {
          selectedRows = [...rows, data];
        }
      }

      return {
        ...state,
        selectedRows,
      };
    },

    /** Table Context */

    [DataTableActionEnums.SetModelType]: (state: IDataTableStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        modelType: payload,
      };
    },
    [DataTableActionEnums.ChangeUserConfigId]: (state: IDataTableStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        userConfigId: payload,
      };
    },
    [DataTableActionEnums.ChangeActionedRow]: (state: IDataTableStateContext, action: ReduxActions.Action<any>) => {
      const { payload } = action;

      return {
        ...state,
        actionedRow: payload,
      };
    },

    [DataTableActionEnums.ChangeSelectedIds]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string[]>
    ) => {
      const { payload } = action;
      return {
        ...state,
        selectedIds: payload,
      };
    },

    [DataTableActionEnums.ChangeDisplayColumn]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;
      return {
        ...state,
        displayColumnName: payload,
      };
    },
    [DataTableActionEnums.ChangePersistedFiltersToggle]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;
      return {
        ...state,
        persistSelectedFilters: payload,
      };
    },

    [DataTableActionEnums.ChangeSelectedStoredFilterIds]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string[]>
    ) => {
      const { payload } = action;

      return {
        ...state,
        selectedStoredFilterIds: payload,
      };
    },

    [DataTableActionEnums.ApplyFilter]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ITableFilter[]>
    ) => {
      const { payload } = action;
      return {
        ...state,
        tableFilter: payload,
        tableFilterDirty: payload,
        currentPage: 1,
      };
    },

    [DataTableActionEnums.ToggleSaveFilterModal]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<boolean>
    ) => {
      const { payload } = action;
      return {
        ...state,
        saveFilterModalVisible: payload,
      };
    },

    [DataTableActionEnums.SetCurrentPage]: (state: IDataTableStateContext, action: ReduxActions.Action<number>) => {
      const { payload } = action;
      return {
        ...state,
        currentPage: payload,
      };
    },

    [DataTableActionEnums.ChangePageSize]: (state: IDataTableStateContext, action: ReduxActions.Action<number>) => {
      const { payload } = action;
      return {
        ...state,
        selectedPageSize: payload,
      };
    },

    [DataTableActionEnums.ChangeQuickSearch]: (state: IDataTableStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;
      return {
        ...state,
        quickSearch: payload,
      };
    },

    [DataTableActionEnums.FetchTableData]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IGetListDataPayload>
    ) => {
      const { payload } = action;

      const newState: IDataTableStateContext = {
        ...state,
        isFetchingTableData: true,
        // note: don't change standard sorting is it's not used to prevent re-renderings
        // standardSorting: isStandardSortingUsed(state) ? payload.sorting : state.standardSorting,
        //userSorting
        currentPage: payload.currentPage,
      };

      return newState;
    },

    [DataTableActionEnums.FetchTableDataError]: (state: IDataTableStateContext) => {
      return {
        ...state,
        isFetchingTableData: false,
        hasFetchTableDataError: true,
      };
    },

    [DataTableActionEnums.FetchTableDataSuccess]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ITableDataInternalResponse>
    ) => {
      const {
        payload: { rows, totalPages, totalRows, totalRowsBeforeFilter },
      } = action;

      return {
        ...state,
        tableData: rows,
        totalPages,
        totalRows,
        totalRowsBeforeFilter,
        isFetchingTableData: false,
      };
    },

    [DataTableActionEnums.FetchColumnsSuccess]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IFetchColumnsSuccessSuccessPayload>
    ) => {
      const {
        payload: { columns, configurableColumns, userConfig },
      } = action;

      const cols = configurableColumns
        ?.map<ITableColumn>((col) => prepareColumn(col, columns, userConfig))
        .filter((c) => c !== null) ?? [];

      const userFilters =
        userConfig?.selectedFilterIds?.length > 0 && state.predefinedFilters?.length > 0
          ? userConfig?.selectedFilterIds?.filter((x) => {
            return state.predefinedFilters?.find((f) => {
              return f.id === x;
            });
          }) ?? []
          : [];

      const selectedStoredFilterIds = state?.selectedStoredFilterIds?.length
        ? [...state.selectedStoredFilterIds]
        : [...userFilters];

      if (selectedStoredFilterIds.length === 0 && state.predefinedFilters?.length > 0)
        selectedStoredFilterIds.push(state.predefinedFilters[0].id);

      const userSorting =
        userConfig && userConfig.tableSorting && userConfig.tableSorting.length > 0
          ? userConfig.tableSorting
          : [];

      return {
        ...state,
        columns: cols,
        // user config
        currentPage: userConfig?.currentPage || 1,
        selectedPageSize: userConfig?.pageSize || state.selectedPageSize || DEFAULT_PAGE_SIZE_OPTIONS[1],
        quickSearch: userConfig?.quickSearch,
        tableFilter: userConfig?.advancedFilter,
        tableFilterDirty: userConfig?.advancedFilter,
        selectedStoredFilterIds,
        userSorting: userSorting,
      };
    },

    [DataTableActionEnums.ToggleColumnFilter]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string[]>
    ) => {
      const { payload: appliedFiltersColumnIds } = action;

      const currentFilter = getDirtyFilter(state);
      const filter = appliedFiltersColumnIds.map<ITableFilter>((id) => {
        const existingFilter = currentFilter.find((f) => f.columnId === id);
        if (existingFilter) return existingFilter;

        const column = getTableDataColumn(state.columns, id);
        const filterOptions = getFilterOptions(column?.dataType);
        return {
          columnId: id,
          filterOption: filterOptions.length > 0 ? filterOptions[0] : null,
          filter: null,
        } as ITableFilter;
      });

      return {
        ...state,
        tableFilterDirty: filter,
      };
    },

    [DataTableActionEnums.ToggleColumnVisibility]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload: columnIdToToggle } = action;

      return {
        ...state,
        columns: state.columns.map(({ id, show, ...rest }) => {
          if (id === columnIdToToggle) {
            return {
              id,
              ...rest,
              show: !show,
            };
          }
          return { id, show, ...rest };
        }),
      };
    },

    [DataTableActionEnums.ChangeFilterOption]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IChangeFilterOptionPayload>
    ) => {
      const {
        payload: { filterColumnId, filterOptionValue },
      } = action;

      const currentFilter = getDirtyFilter(state);

      const filter = currentFilter.map<ITableFilter>((f) => ({
        ...f,
        filterOption: f.columnId === filterColumnId ? filterOptionValue : f.filterOption,
      }));

      return {
        ...state,
        tableFilterDirty: filter,
      };
    },

    [DataTableActionEnums.ChangeFilter]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IChangeFilterAction>
    ) => {
      const {
        payload: { filterColumnId, filterValue },
      } = action;

      const currentFilter = getDirtyFilter(state);

      const filter = currentFilter.map<ITableFilter>((f) => ({
        ...f,
        filter: f.columnId === filterColumnId ? filterValue : f.filter,
      }));

      return {
        ...state,
        tableFilterDirty: filter,
      };
    },

    [DataTableActionEnums.SetPredefinedFilters]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ISetPredefinedFiltersPayload>
    ) => {
      const { predefinedFilters, userConfig } = action.payload;

      const uc = userConfig?.selectedFilterIds?.filter((x) => {
        return predefinedFilters?.find((f) => {
          return f.id === x;
        });
      });

      const selectedStoredFilterIds =
        (!Boolean(state.selectedStoredFilterIds) || state.selectedStoredFilterIds.length === 0) &&
          predefinedFilters?.length > 0
          ? Boolean(uc) && uc.length > 0
            ? uc
            : [predefinedFilters[0].id]
          : state.selectedStoredFilterIds;

      return {
        ...state,
        predefinedFilters,
        selectedStoredFilterIds,
      };
    },

    [DataTableActionEnums.SetPermanentFilter]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ISetPermanentFilterActionPayload>
    ) => {
      const { filter } = action.payload;

      return {
        ...state,
        permanentFilter: filter,
      };
    },

    [DataTableActionEnums.RegisterConfigurableColumns]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IRegisterConfigurableColumnsPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        configurableColumns: payload?.columns?.length > 0 ? [...payload.columns] : [],
      };
    },

    [DataTableActionEnums.OnSort]: (state: IDataTableStateContext, action: ReduxActions.Action<IColumnSorting[]>) => {
      const { payload } = action;
      return {
        ...state,
        userSorting: [...payload],
      };
    },

    [DataTableActionEnums.OnGroup]: (state: IDataTableStateContext, action: ReduxActions.Action<ISortingItem[]>) => {
      const { payload } = action;
      return {
        ...state,
        grouping: [...payload]
      };
    },

    [DataTableActionEnums.ExportToExcelError]: (state: IDataTableStateContext, action: ReduxActions.Action<string>) => {
      const { payload } = action;

      return {
        ...state,
        exportToExcelError: payload,
      };
    },

    [DataTableActionEnums.ExportToExcelWarning]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string>
    ) => {
      const { payload } = action;

      return {
        ...state,
        exportToExcelWarning: payload,
      };
    },

    [DataTableActionEnums.SetRowData]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ISetRowDataPayload>
    ) => {
      const {
        payload: { rowData, rowIndex },
      } = action;
      const { tableData } = state;

      const newData = [...tableData];
      newData.splice(rowIndex, 1, rowData);

      return {
        ...state,
        tableData: newData,
      };
    },

    [DataTableActionEnums.SetDataFetchingMode]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<DataFetchingMode>
    ) => {
      const { payload } = action;

      return {
        ...state,
        dataFetchingMode: payload,
      };
    },

    [DataTableActionEnums.SetSortingSettings]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<ISortingSettingsActionPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        sortMode: payload.sortMode,
        strictSortBy: payload.strictSortBy,
        strictSortOrder: payload.strictSortOrder,
        allowReordering: payload.allowReordering,
      };
    },

    [DataTableActionEnums.SetStandardSorting]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IColumnSorting[]>
    ) => {
      const { payload } = action;

      return {
        ...state,
        standardSorting: [...payload],
      };
    },

    [DataTableActionEnums.FetchGroupingColumnsSuccess]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IFetchGroupingColumnsSuccessPayload>
    ) => {
      const { payload } = action;

      const columns = payload.columns
        .map<ITableDataColumn>(column => ({
          columnType: 'data',
          propertyName: column.propertyName,

          id: column.propertyName,
          accessor: column.propertyName,
          columnId: column.propertyName,

          header: column.caption,
          caption: column.caption,
          isVisible: true,
          show: true,
          isFilterable: false,
          isSortable: false,
          allowShowHide: false,

          dataType: column.dataType as ProperyDataType,
          dataFormat: column.dataFormat,
          entityReferenceTypeShortAlias: column.entityReferenceTypeShortAlias,
          referenceListName: column.referenceListName,
          referenceListModule: column.referenceListModule,
          allowInherited: column.allowInherited,
          metadata: column.metadata,
        }))
        .filter(c => c !== null);

      return {
        ...state,
        groupingColumns: state.groupingColumns.length === 0 && columns.length === 0 ? state.groupingColumns : columns,
        grouping: payload.grouping,
      };
    },
  },
  DATA_TABLE_CONTEXT_INITIAL_STATE
);

export function dataTableReducerInternal(
  incomingState: IDataTableStateContext,
  action: ReduxActions.Action<any>
): IDataTableStateContext {
  const flaggedState = flagsReducer(incomingState, action) as IDataTableStateContext;
  const newState = reducer(flaggedState, action);

  return newState;
}

export { dataTableReducerInternal as dataTableReducer };
