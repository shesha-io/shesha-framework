import { createAction } from 'redux-actions';
import { IConfigurableColumnsBase } from '../datatableColumnsConfigurator/models';
import { IDataTableStateContext, IDataTableUserConfig } from './contexts';
import {
  IndexColumnFilterOption,
  ITableFilter,
  IGetDataPayloadInternal,
  IColumnSorting,
  DataTableColumnDto,
  ITableDataInternalResponse,
} from './interfaces';

export enum DataTableActionEnums {
  FetchColumnsSuccess = 'FETCH_COLUMNS_SUCCESS',

  FetchTableData = 'FETCH_TABLE_DATA',
  FetchTableDataSuccess = 'FETCH_TABLE_DATA_SUCCESS',
  FetchTableDataError = 'FETCH_TABLE_DATA_ERROR',

  ExportToExcelRequest = 'EXPORT_TO_EXCEL_REQUEST',
  ExportToExcelSuccess = 'EXPORT_TO_EXCEL_SUCCESS',
  ExportToExcelError = 'EXPORT_TO_EXCEL_ERROR',
  ExportToExcelWarning = 'EXPORT_TO_EXCEL_WARNING',

  ChangePageSize = 'CHANGE_PAGE_SIZE',
  SetCurrentPage = 'SET_CURRENT_PAGE',

  ToggleColumnVisibility = 'TOGGLE_COLUMN_VISIBILITY',
  ToggleColumnFilter = 'TOGGLE_COLUMN_FILTER',
  ChangeFilterOption = 'CHANGE_FILTER_OPTION',
  ChangeFilter = 'CHANGE_FILTER',
  ApplyFilter = 'APPLY_FILTER',
  ChangeQuickSearch = 'CHANGE_QUICK_SEARCH',
  ToggleSaveFilterModal = 'TOGGLE_SAVE_FILTER_MODAL',
  ChangeUserConfigId = 'CHANGE_USER_CONFIG_ID',
  ChangeSelectedRow = 'CHANGE_SELECTED_ROW',
  ChangeActionedRow = 'CHANGE_ACTIONED_ROW',
  ChangeSelectedStoredFilterIds = 'CHANGE_SELECTED_STORED_FILTER_IDS',
  SetPredefinedFilters = 'REGISTER_STORED_FILTER',
  ChangeSelectedIds = 'CHANGE_SELECTED_IDS',
  RegisterConfigurableColumns = 'REGISTER_CONFIGURABLE_COLUMNS',
  OnSelectRow = 'ON_SELECT_ROW',
  OnSort = 'ON_SORT',

  ChangeDisplayColumn = 'CHANGE_DISPLAY_COLUMN',
  ChangePersistedFiltersToggle = 'CHANGE_PERSISTED_FILTERS_TOGGLE',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const fetchTableDataAction = createAction<IGetDataPayloadInternal, IGetDataPayloadInternal>(
  DataTableActionEnums.FetchTableData,
  p => p
);

export const fetchTableDataSuccessAction = createAction<ITableDataInternalResponse, ITableDataInternalResponse>(
  DataTableActionEnums.FetchTableDataSuccess,
  p => p
);

export const fetchTableDataErrorAction = createAction(DataTableActionEnums.FetchTableDataError, () => {
  /*nop*/
});

export interface IFetchColumnsSuccessSuccessPayload {
  columns: DataTableColumnDto[];
  configurableColumns: IConfigurableColumnsBase[];
  userConfig: IDataTableUserConfig;
}
export const fetchColumnsSuccessSuccessAction = createAction<
  IFetchColumnsSuccessSuccessPayload,
  IFetchColumnsSuccessSuccessPayload
>(DataTableActionEnums.FetchColumnsSuccess, p => p);

export const changePageSizeAction = createAction<number, number>(DataTableActionEnums.ChangePageSize, p => p);

export const changeQuickSearchAction = createAction<string, string>(DataTableActionEnums.ChangeQuickSearch, p => p);

export const toggleSaveFilterModalAction = createAction<boolean, boolean>(
  DataTableActionEnums.ToggleSaveFilterModal,
  p => p
);

export const setCurrentPageAction = createAction<number, number>(DataTableActionEnums.SetCurrentPage, p => p);

export const toggleColumnVisibilityAction = createAction<string, string>(
  DataTableActionEnums.ToggleColumnVisibility,
  p => p
);

export const toggleColumnFilterAction = createAction<string[], string[]>(
  DataTableActionEnums.ToggleColumnFilter,
  p => p
);

export interface IChangeFilterOptionPayload {
  filterColumnId: string;
  filterOptionValue: IndexColumnFilterOption;
}
export const changeFilterOptionAction = createAction<IChangeFilterOptionPayload, IChangeFilterOptionPayload>(
  DataTableActionEnums.ChangeFilterOption,
  p => p
);

export interface IChangeFilterAction {
  filterColumnId: string;
  filterValue: any;
}

export const changeFilterAction = createAction<IChangeFilterAction, IChangeFilterAction>(
  DataTableActionEnums.ChangeFilter,
  p => p
);

export const applyFilterAction = createAction<ITableFilter[], ITableFilter[]>(DataTableActionEnums.ApplyFilter, p => p);

export const changeUserConfigIdAction = createAction<any, any>(DataTableActionEnums.ChangeUserConfigId, p => p);

export const changeSelectedRowAction = createAction<any, any>(DataTableActionEnums.ChangeSelectedRow, p => p);

export const changeActionedRowAction = createAction<any, any>(DataTableActionEnums.ChangeActionedRow, p => p);

export const changeSelectedStoredFilterIdsAction = createAction<string[], string[]>(
  DataTableActionEnums.ChangeSelectedStoredFilterIds,
  p => p
);

export const setPredefinedFiltersAction = createAction<
  Pick<IDataTableStateContext, 'predefinedFilters' | 'userConfigId'>,
  Pick<IDataTableStateContext, 'predefinedFilters' | 'userConfigId'>
>(DataTableActionEnums.SetPredefinedFilters, p => p);

export const changeSelectedIdsAction = createAction<string[], string[]>(DataTableActionEnums.ChangeSelectedIds, p => p);

export const exportToExcelRequestAction = createAction(DataTableActionEnums.ExportToExcelRequest);
export const exportToExcelSuccessAction = createAction(DataTableActionEnums.ExportToExcelSuccess);
export const exportToExcelErrorAction = createAction<string, string>(DataTableActionEnums.ExportToExcelError, p => p);
export const exportToExcelWarningAction = createAction<string, string>(
  DataTableActionEnums.ExportToExcelWarning,
  p => p
);

export interface IRegisterConfigurableColumnsPayload {
  /** owner of the columns list, not used now and may be removed later */
  ownerId: string;
  columns: IConfigurableColumnsBase[];
}
export const registerConfigurableColumnsAction = createAction<
  IRegisterConfigurableColumnsPayload,
  IRegisterConfigurableColumnsPayload
>(DataTableActionEnums.RegisterConfigurableColumns, p => p);

export const onSortAction = createAction<IColumnSorting[], IColumnSorting[]>(DataTableActionEnums.OnSort, p => p);

/* NEW_ACTION_GOES_HERE */

export const changeDisplayColumnAction = createAction<string, string>(DataTableActionEnums.ChangeDisplayColumn, p => p);

export const changePersistedFiltersToggleAction = createAction<boolean, boolean>(
  DataTableActionEnums.ChangePersistedFiltersToggle,
  p => p
);
