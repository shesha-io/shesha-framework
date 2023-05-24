import {
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  IDataTableStateContext,
} from './contexts';
import {
  DataTableActionEnums,
  IChangeFilterAction,
  IChangeFilterOptionPayload,
  IFetchColumnsSuccessSuccessPayload,
  IRegisterConfigurableColumnsPayload,
  ISetRowDataPayload,
} from './actions';
import flagsReducer from '../utils/flagsReducer';
import {
  IColumnSorting,
  IGetListDataPayload,
  IStoredFilter,
  ITableColumn,
  ITableDataInternalResponse,
  ITableFilter,
} from './interfaces';
import { handleActions } from 'redux-actions';
import { getFilterOptions } from '../../components/columnItemFilter';
import { getTableDataColumn, getTableDataColumns, prepareColumn } from './utils';

/** get dirty filter if exists and fallback to current filter state */
const getDirtyFilter = (state: IDataTableStateContext): ITableFilter[] => {
  return [...(state.tableFilterDirty || state.tableFilter || [])];
};

const reducer = handleActions<IDataTableStateContext, any>(
  {
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
    [DataTableActionEnums.ChangeSelectedRow]: (state: IDataTableStateContext, action: ReduxActions.Action<any>) => {
      const { payload } = action;
      
      return {
        ...state,
        selectedRow: payload?.id === state?.selectedRow?.id ? null : payload,
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

      // const selectedStoredFilterIds = state?.selectedStoredFilterIds?.length
      //   ? state?.selectedStoredFilterIds
      //   : payload.selectedFilterIds ?? [];

      const newState: IDataTableStateContext = {
        ...state,
        isFetchingTableData: true,
        tableSorting: payload.sorting,
        currentPage: payload.currentPage,
        //parentEntityId: payload.parentEntityId,
        //selectedStoredFilterIds, // TODO: Review the saving of filters
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
        .map<ITableColumn>(col => prepareColumn(col, columns, userConfig))     
        .filter(c => c !== null);

      const dataCols = getTableDataColumns(cols);
      const configuredTableSorting = dataCols
        .filter(c => c.defaultSorting !== null && c.defaultSorting !== undefined && c.propertyName)
        .map<IColumnSorting>(c => ({ id: c.id, desc: c.defaultSorting === 1 }));

      const tableSorting =
        userConfig && userConfig.tableSorting && userConfig.tableSorting.length > 0
          ? userConfig.tableSorting
          : configuredTableSorting;

      const userFilters = userConfig?.selectedFilterIds?.length > 0 && state.predefinedFilters?.length > 0
        ? userConfig?.selectedFilterIds?.filter(x => {
            return state.predefinedFilters?.find(f => {
              return f.id = x;
            });
          }) ?? []
        : [];

      const selectedStoredFilterIds = state?.selectedStoredFilterIds?.length
        ? [...state.selectedStoredFilterIds]
        : [...userFilters];

      if (selectedStoredFilterIds.length === 0 && state.predefinedFilters?.length > 0)
        selectedStoredFilterIds.push(state.predefinedFilters[0].id);

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
        tableSorting: tableSorting,
      };
    },

    [DataTableActionEnums.ToggleColumnFilter]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<string[]>
    ) => {
      const { payload: appliedFiltersColumnIds } = action;

      const currentFilter = getDirtyFilter(state);
      const filter = appliedFiltersColumnIds.map<ITableFilter>(id => {
        const existingFilter = currentFilter.find(f => f.columnId === id);
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

      const filter = currentFilter.map<ITableFilter>(f => ({
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

      const filter = currentFilter.map<ITableFilter>(f => ({
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
      action: ReduxActions.Action<IStoredFilter[]>
    ) => {
      const { payload } = action;
      
      return {
        ...state,
        predefinedFilters: payload || [],
      };
    },

    [DataTableActionEnums.RegisterConfigurableColumns]: (
      state: IDataTableStateContext,
      action: ReduxActions.Action<IRegisterConfigurableColumnsPayload>
    ) => {
      const { payload } = action;

      return {
        ...state,
        configurableColumns: [...payload.columns],
      };
    },

    [DataTableActionEnums.OnSort]: (state: IDataTableStateContext, action: ReduxActions.Action<IColumnSorting[]>) => {
      const { payload } = action;

      return {
        ...state,
        tableSorting: [...payload],
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
      const { payload: { rowData, rowIndex } } = action;
      const { tableData } = state;

      const newData = [...tableData];
      newData.splice(rowIndex, 1, rowData);

      return {
        ...state,
        tableData: newData,
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

/*
const withTrace = <State, Payload>(initial: ReduxCompatibleReducer<State, Payload>): ReduxCompatibleReducer<State, Payload> => {
  return (state, action) => {
    console.log('TRACE: DT action', action);
    return initial(state, action);
  };
};

export const dataTableReducer = withTrace(dataTableReducerInternal);
*/

export { dataTableReducerInternal as dataTableReducer };