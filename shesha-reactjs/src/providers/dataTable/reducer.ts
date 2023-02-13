import {
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  IDataTableStateContext,
  MIN_COLUMN_WIDTH,
} from './contexts';
import {
  DataTableActionEnums,
  IChangeFilterAction,
  IChangeFilterOptionPayload,
  IFetchColumnsSuccessSuccessPayload,
  IRegisterConfigurableColumnsPayload,
} from './actions';
import flagsReducer from '../utils/flagsReducer';
import {
  IColumnSorting,
  IGetDataPayloadInternal,
  IndexColumnDataType,
  ITableColumn,
  ITableDataInternalResponse,
  ITableFilter,
} from './interfaces';
import { handleActions } from 'redux-actions';
import {
  IConfigurableActionColumnsProps,
  IConfigurableColumnsProps,
  IDataColumnsProps,
} from '../datatableColumnsConfigurator/models';
import { getFilterOptions } from '../../components/columnItemFilter';
import { camelcaseDotNotation } from '../form/utils';
import { getIncomingSelectedStoredFilterIds } from './utils';

/** get dirty filter if exists and fallback to current filter state */
const getDirtyFilter = (state: IDataTableStateContext): ITableFilter[] => {
  return [...(state.tableFilterDirty || state.tableFilter || [])];
};

const reducer = handleActions<IDataTableStateContext, any>(
  {
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
      action: ReduxActions.Action<IGetDataPayloadInternal>
    ) => {
      const { payload } = action;

      const selectedStoredFilterIds = state?.selectedStoredFilterIds?.length
        ? state?.selectedStoredFilterIds
        : payload.selectedFilterIds ?? [];

      return {
        ...state,
        isFetchingTableData: true,
        tableSorting: payload.sorting,
        currentPage: payload.currentPage,
        selectedPageSize: payload.pageSize,
        parentEntityId: payload.parentEntityId,
        selectedStoredFilterIds, // TODO: Review the saving of filters
        // selectedStoredFilterIds: payload.selectedStoredFilterIds ?? [],
      };
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
        .map<ITableColumn>(column => {
          const dataProps = column as IDataColumnsProps;
          const colProps = column as IConfigurableColumnsProps;
          const userColumn = userConfig?.columns?.find(c => c.id === dataProps?.propertyName);
          const colVisibility =
            userColumn?.show === null || userColumn?.show === undefined ? column.isVisible : userColumn?.show;

          switch (colProps.columnType) {
            case 'data': {
              const srvColumn = dataProps.propertyName
                ? columns.find(
                    c => camelcaseDotNotation(c.propertyName) === camelcaseDotNotation(dataProps.propertyName)
                  )
                : {};

              return {
                id: dataProps?.propertyName,
                columnId: column.id,
                accessor: camelcaseDotNotation(dataProps?.propertyName),
                propertyName: dataProps?.propertyName,
                minWidth: column.minWidth || MIN_COLUMN_WIDTH,
                maxWidth: column.minWidth,
                isEditable: colProps.isEditable,

                dataType: srvColumn?.dataType as IndexColumnDataType,
                dataFormat: srvColumn?.dataFormat,
                isSortable: srvColumn?.isSortable,
                isFilterable: srvColumn?.isFilterable,
                entityReferenceTypeShortAlias: srvColumn?.entityReferenceTypeShortAlias,
                referenceListName: srvColumn?.referenceListName,
                referenceListModule: srvColumn?.referenceListModule,
                autocompleteUrl: srvColumn?.autocompleteUrl,
                allowInherited: srvColumn?.allowInherited,

                caption: column.caption,
                header: column.caption,
                isVisible: column.isVisible,
                allowShowHide: true,

                show: colVisibility,
              };
            }
            case 'action': {
              const actionProps = column as IConfigurableActionColumnsProps;

              return {
                id: column.id,
                columnId: column.id,
                accessor: column.id,
                propertyName: column.id,
                minWidth: column.minWidth,
                maxWidth: column.minWidth,

                dataType: 'action',
                actionProps, // todo: review and add to interface

                isSortable: false,
                isFilterable: false,

                caption: column.caption,
                header: column.caption,
                isVisible: column.isVisible,
                allowShowHide: false,

                show: column.isVisible,
              };
            }
          }
          return null;
        })
        .filter(c => c !== null);

      const configuredTableSorting = cols
        .filter(c => c.defaultSorting !== null && c.defaultSorting !== undefined && c.propertyName)
        .map<IColumnSorting>(c => ({ id: c.id, desc: c.defaultSorting === 1 }));

      const tableSorting =
        userConfig && userConfig.tableSorting && userConfig.tableSorting.length > 0
          ? userConfig.tableSorting
          : configuredTableSorting;

      const selectedStoredFilterIds = state?.selectedStoredFilterIds?.length
        ? state?.selectedStoredFilterIds
        : userConfig.selectedFilterIds ?? [];

      return {
        ...state,
        columns: cols,
        // user config
        currentPage: userConfig?.currentPage || 1,
        selectedPageSize: userConfig?.pageSize || DEFAULT_PAGE_SIZE_OPTIONS[1],
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

        const column = state.columns.find(c => c.id === id);
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
      action: ReduxActions.Action<Pick<IDataTableStateContext, 'predefinedFilters' | 'userConfigId'>>
    ) => {
      const { payload } = action;
      const { selectedStoredFilterIds } = state;
      const { predefinedFilters: filters, userConfigId } = payload;

      // Make sure that whenever you set the `predefinedFilters` the first one is the selected
      // This is because the logic for displaying the title is that it should be a part of the filters
      // So that, by default, the first filter is the selected one
      const incomingSelectedStoredFilterIds = getIncomingSelectedStoredFilterIds(filters, userConfigId);

      return {
        ...state,
        predefinedFilters: filters || [],
        selectedStoredFilterIds: selectedStoredFilterIds?.length
          ? selectedStoredFilterIds
          : incomingSelectedStoredFilterIds,
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
  },
  DATA_TABLE_CONTEXT_INITIAL_STATE
);

export function dataTableReducer(
  incomingState: IDataTableStateContext,
  action: ReduxActions.Action<any>
): IDataTableStateContext {
  const flaggedState = flagsReducer(incomingState, action) as IDataTableStateContext;
  const newState = reducer(flaggedState, action);

  return newState;
}
