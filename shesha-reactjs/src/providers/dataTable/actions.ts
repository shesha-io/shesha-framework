import { Row } from 'react-table';
import { createAction } from 'redux-actions';
import { IConfigurableColumnsProps } from '../datatableColumnsConfigurator/models';
import { DragState, IDataTableUserConfig, ISelectionProps } from './contexts';
import {
  DataFetchingMode,
  DataTableColumnDto,
  IColumnSorting,
  IGetListDataPayload,
  IStoredFilter,
  ITableDataInternalResponse,
  ITableFilter,
  IndexColumnFilterOption,
  SortMode,
  ColumnSorting,
  ISortingItem,
  GroupingItem,
  FilterExpression,
} from './interfaces';

export enum DataTableActionEnums {
  FetchColumnsSuccess = 'FETCH_COLUMNS_SUCCESS',

  FetchTableData = 'FETCH_TABLE_DATA',
  FetchTableDataSuccess = 'FETCH_TABLE_DATA_SUCCESS',
  FetchTableDataError = 'FETCH_TABLE_DATA_ERROR',

  SetRowData = 'SET_ROW_DATA',

  ExportToExcelRequest = 'EXPORT_TO_EXCEL_REQUEST',
  ExportToExcelSuccess = 'EXPORT_TO_EXCEL_SUCCESS',
  ExportToExcelError = 'EXPORT_TO_EXCEL_ERROR',
  ExportToExcelWarning = 'EXPORT_TO_EXCEL_WARNING',

  ChangePageSize = 'CHANGE_PAGE_SIZE',
  SetCurrentPage = 'SET_CURRENT_PAGE',

  ToggleColumnVisibility = 'TOGGLE_COLUMN_VISIBILITY',
  ToggleColumnFilter = 'TOGGLE_COLUMN_FILTER',
  RemoveColumnFilter = 'REMOVE_COLUMN_FILTER',
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
  SetPermanentFilter = 'SET_PERMANENT_FILTER',
  ChangeSelectedIds = 'CHANGE_SELECTED_IDS',
  RegisterConfigurableColumns = 'REGISTER_CONFIGURABLE_COLUMNS',
  OnSelectRow = 'ON_SELECT_ROW',
  OnSort = 'ON_SORT',
  OnGroup = 'ON_GROUP',
  SetModelType = 'SET_MODEL_TYPE',
  SetDataFetchingMode = 'SET_DATA_FETCHING_MODE',

  ChangeDisplayColumn = 'CHANGE_DISPLAY_COLUMN',
  ChangePersistedFiltersToggle = 'CHANGE_PERSISTED_FILTERS_TOGGLE',

  // selections
  SetSelectedRow = 'SET_SELECTED_ROW',
  SetHoverRow = 'SET_HOVER_ROW',
  SetDraggingState = 'SET_DRAGGING_STATE',
  SetMultiSelectedRow = 'SET_MULTI_SELECTED_ROW',

  FetchGroupingColumns = 'FETCH_GROUPING_COLUMNS',
  FetchGroupingColumnsSuccess = 'FETCH_GROUPING_COLUMNS_SUCCESS',
  SetSortingSettings = 'SET_SORTING_SETTINGS',
  SetStandardSorting = 'SET_STANDARD_SORTING',
}

export const setSelectedRowAction = createAction<ISelectionProps, ISelectionProps>(
  DataTableActionEnums.SetSelectedRow,
  p => p
);

export const setHoverRowAction = createAction<string, string>(
  DataTableActionEnums.SetHoverRow,
  p => p
);

export const setDraggingRowAction = createAction<DragState, DragState>(
  DataTableActionEnums.SetDraggingState,
  p => p
);

export const setMultiSelectedRowAction = createAction<Array<Row> | Row, Array<Row> | Row>(
  DataTableActionEnums.SetMultiSelectedRow,
  p => p
);

export const setModelTypeAction = createAction<string, string>(
  DataTableActionEnums.SetModelType,
  p => p
);

export const fetchTableDataAction = createAction<IGetListDataPayload, IGetListDataPayload>(
  DataTableActionEnums.FetchTableData,
  (p) => p
);

export const fetchTableDataSuccessAction = createAction<ITableDataInternalResponse, ITableDataInternalResponse>(
  DataTableActionEnums.FetchTableDataSuccess,
  (p) => p
);

export const fetchTableDataErrorAction = createAction(DataTableActionEnums.FetchTableDataError, () => {
  /*nop*/
});

export interface ISetRowDataPayload {
  rowIndex: number;
  rowData: any;
}
export const setRowDataAction = createAction<ISetRowDataPayload, ISetRowDataPayload>(
  DataTableActionEnums.SetRowData,
  (p) => p
);

export interface IFetchColumnsSuccessSuccessPayload {
  columns: DataTableColumnDto[];
  configurableColumns: IConfigurableColumnsProps[];
  userConfig: IDataTableUserConfig;
}
export const fetchColumnsSuccessSuccessAction = createAction<
  IFetchColumnsSuccessSuccessPayload,
  IFetchColumnsSuccessSuccessPayload
>(DataTableActionEnums.FetchColumnsSuccess, (p) => p);

export const changePageSizeAction = createAction<number, number>(DataTableActionEnums.ChangePageSize, (p) => p);

export const changeQuickSearchAction = createAction<string, string>(DataTableActionEnums.ChangeQuickSearch, (p) => p);

export const toggleSaveFilterModalAction = createAction<boolean, boolean>(
  DataTableActionEnums.ToggleSaveFilterModal,
  (p) => p
);

export const setCurrentPageAction = createAction<number, number>(DataTableActionEnums.SetCurrentPage, (p) => p);

export const toggleColumnVisibilityAction = createAction<string, string>(
  DataTableActionEnums.ToggleColumnVisibility,
  (p) => p
);

export const toggleColumnFilterAction = createAction<string[], string[]>(
  DataTableActionEnums.ToggleColumnFilter,
  (p) => p
);

export const removeColumFilterAction = createAction<string, any>(DataTableActionEnums.RemoveColumnFilter, (p) => p);

export interface IChangeFilterOptionPayload {
  filterColumnId: string;
  filterOptionValue: IndexColumnFilterOption;
}
export const changeFilterOptionAction = createAction<IChangeFilterOptionPayload, IChangeFilterOptionPayload>(
  DataTableActionEnums.ChangeFilterOption,
  (p) => p
);

export interface IChangeFilterAction {
  filterColumnId: string;
  filterValue: any;
}

export const changeFilterAction = createAction<IChangeFilterAction, IChangeFilterAction>(
  DataTableActionEnums.ChangeFilter,
  (p) => p
);

export const applyFilterAction = createAction<ITableFilter[], ITableFilter[]>(
  DataTableActionEnums.ApplyFilter,
  (p) => p
);

export const changeUserConfigIdAction = createAction<any, any>(DataTableActionEnums.ChangeUserConfigId, (p) => p);

export const changeSelectedRowAction = createAction<any, any>(DataTableActionEnums.ChangeSelectedRow, (p) => p);

export const changeActionedRowAction = createAction<any, any>(DataTableActionEnums.ChangeActionedRow, (p) => p);

export const changeSelectedStoredFilterIdsAction = createAction<string[], string[]>(
  DataTableActionEnums.ChangeSelectedStoredFilterIds,
  (p) => p
);

export interface ISetPredefinedFiltersPayload {
  predefinedFilters: IStoredFilter[];
  userConfig: IDataTableUserConfig;
}
export const setPredefinedFiltersAction = createAction<ISetPredefinedFiltersPayload, ISetPredefinedFiltersPayload>(
  DataTableActionEnums.SetPredefinedFilters,
  (p) => p
);

export interface ISetPermanentFilterActionPayload {
  filter: FilterExpression;
}
export const setPermanentFilterAction = createAction<ISetPermanentFilterActionPayload, ISetPermanentFilterActionPayload>(
  DataTableActionEnums.SetPermanentFilter,
  (p) => p
);

export const changeSelectedIdsAction = createAction<string[], string[]>(
  DataTableActionEnums.ChangeSelectedIds,
  (p) => p
);

export const exportToExcelRequestAction = createAction(DataTableActionEnums.ExportToExcelRequest);
export const exportToExcelSuccessAction = createAction(DataTableActionEnums.ExportToExcelSuccess);
export const exportToExcelErrorAction = createAction<string, string>(DataTableActionEnums.ExportToExcelError, (p) => p);
export const exportToExcelWarningAction = createAction<string, string>(
  DataTableActionEnums.ExportToExcelWarning,
  (p) => p
);

export interface IRegisterConfigurableColumnsPayload {
  /** owner of the columns list, not used now and may be removed later */
  ownerId: string;
  columns: IConfigurableColumnsProps[];
}
export const registerConfigurableColumnsAction = createAction<
  IRegisterConfigurableColumnsPayload,
  IRegisterConfigurableColumnsPayload
>(DataTableActionEnums.RegisterConfigurableColumns, (p) => p);

export const onSortAction = createAction<IColumnSorting[], IColumnSorting[]>(DataTableActionEnums.OnSort, (p) => p);

export const onGroupAction = createAction<ISortingItem[], ISortingItem[]>(DataTableActionEnums.OnGroup, (p) => p);

/* NEW_ACTION_GOES_HERE */

export const changeDisplayColumnAction = createAction<string, string>(
  DataTableActionEnums.ChangeDisplayColumn,
  (p) => p
);

export const changePersistedFiltersToggleAction = createAction<boolean, boolean>(
  DataTableActionEnums.ChangePersistedFiltersToggle,
  (p) => p
);

export const setDataFetchingModeAction = createAction<DataFetchingMode, DataFetchingMode>(
  DataTableActionEnums.SetDataFetchingMode,
  p => p
);

export interface IFetchGroupingColumnsSuccessPayload {
  grouping: GroupingItem[];
  columns: DataTableColumnDto[];
}
export const fetchGroupingColumnsSuccessAction = createAction<
  IFetchGroupingColumnsSuccessPayload,
  IFetchGroupingColumnsSuccessPayload
>(DataTableActionEnums.FetchGroupingColumnsSuccess, p => p);

export interface ISortingSettingsActionPayload {
  sortMode?: SortMode;
  strictSortBy?: string;
  strictSortOrder?: ColumnSorting;
  allowReordering: boolean;
}
export const setSortingSettingsAction = createAction<
  ISortingSettingsActionPayload,
  ISortingSettingsActionPayload
>(DataTableActionEnums.SetSortingSettings, p => p);

export const setStandardSortingAction = createAction<
  IColumnSorting[],
  IColumnSorting[]
>(DataTableActionEnums.SetStandardSorting, p => p);