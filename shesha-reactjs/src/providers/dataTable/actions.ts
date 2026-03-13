import { Row } from 'react-table';
import { createAction } from '@reduxjs/toolkit';
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
  ITableRowData,
  ColumnFilter,
} from './interfaces';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { IModelValidation } from '@/utils/errors';

export enum DataTableActionEnums {
  FetchColumnsSuccess = 'FETCH_COLUMNS_SUCCESS',

  FetchTableData = 'FETCH_TABLE_DATA',
  FetchTableDataSuccess = 'FETCH_TABLE_DATA_SUCCESS',
  FetchTableDataError = 'FETCH_TABLE_DATA_ERROR',

  SetRowData = 'SET_ROW_DATA',

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
  SetDraggingState = 'SET_DRAGGING_STATE',
  SetMultiSelectedRow = 'SET_MULTI_SELECTED_ROW',

  FetchGroupingColumns = 'FETCH_GROUPING_COLUMNS',
  FetchGroupingColumnsSuccess = 'FETCH_GROUPING_COLUMNS_SUCCESS',
  SetSortingSettings = 'SET_SORTING_SETTINGS',
  SetStandardSorting = 'SET_STANDARD_SORTING',
  SetContextValidation = 'SET_CONTEXT_VALIDATION',
  ToggleAdvancedFilter = 'TOGGLE_ADVANCED_FILTER',
  ToggleColumnsSelector = 'TOGGLE_COLUMNS_SELECTOR',
}

export const setSelectedRowAction = createAction<ISelectionProps | undefined>(DataTableActionEnums.SetSelectedRow);

export const setDraggingRowAction = createAction<DragState>(DataTableActionEnums.SetDraggingState);

export const setMultiSelectedRowAction = createAction<Array<Row<ITableRowData>> | Row<ITableRowData>>(DataTableActionEnums.SetMultiSelectedRow);

export const setModelTypeAction = createAction<string | IEntityTypeIdentifier | undefined>(DataTableActionEnums.SetModelType);

export const fetchTableDataAction = createAction<IGetListDataPayload>(DataTableActionEnums.FetchTableData);

export const fetchTableDataSuccessAction = createAction<ITableDataInternalResponse>(DataTableActionEnums.FetchTableDataSuccess);

export interface IFetchTableDataErrorPayload {
  error: unknown;
}

export const fetchTableDataErrorAction = createAction<IFetchTableDataErrorPayload>(DataTableActionEnums.FetchTableDataError);

export interface ISetRowDataPayload {
  rowIndex: number;
  rowData: object;
}
export const setRowDataAction = createAction<ISetRowDataPayload>(DataTableActionEnums.SetRowData);

export interface IFetchColumnsSuccessSuccessPayload {
  columns: DataTableColumnDto[];
  configurableColumns: IConfigurableColumnsProps[];
  userConfig: IDataTableUserConfig | undefined;
}
export const fetchColumnsSuccessSuccessAction = createAction<IFetchColumnsSuccessSuccessPayload>(DataTableActionEnums.FetchColumnsSuccess);

export const changePageSizeAction = createAction<number>(DataTableActionEnums.ChangePageSize);

export const changeQuickSearchAction = createAction<string, string>(DataTableActionEnums.ChangeQuickSearch);

export const toggleSaveFilterModalAction = createAction<boolean>(DataTableActionEnums.ToggleSaveFilterModal);

export const setCurrentPageAction = createAction<number>(DataTableActionEnums.SetCurrentPage);

export const toggleColumnVisibilityAction = createAction<string>(DataTableActionEnums.ToggleColumnVisibility);

export const toggleColumnFilterAction = createAction<string[]>(DataTableActionEnums.ToggleColumnFilter);

export const removeColumFilterAction = createAction<string>(DataTableActionEnums.RemoveColumnFilter);

export interface IChangeFilterOptionPayload {
  filterColumnId: string;
  filterOptionValue: IndexColumnFilterOption;
}
export const changeFilterOptionAction = createAction<IChangeFilterOptionPayload>(DataTableActionEnums.ChangeFilterOption);

export interface IChangeFilterAction {
  filterColumnId: string;
  filterValue: ColumnFilter;
}

export const changeFilterAction = createAction<IChangeFilterAction>(DataTableActionEnums.ChangeFilter);

export const applyFilterAction = createAction<ITableFilter[] | undefined>(DataTableActionEnums.ApplyFilter);

export const changeActionedRowAction = createAction<unknown>(DataTableActionEnums.ChangeActionedRow);

export const changeSelectedStoredFilterIdsAction = createAction<string[]>(DataTableActionEnums.ChangeSelectedStoredFilterIds);

export interface ISetPredefinedFiltersPayload {
  predefinedFilters: IStoredFilter[] | undefined;
  userConfig: IDataTableUserConfig | undefined;
}
export const setPredefinedFiltersAction = createAction<ISetPredefinedFiltersPayload>(DataTableActionEnums.SetPredefinedFilters);

export interface ISetPermanentFilterActionPayload {
  filter: FilterExpression | undefined;
}
export const setPermanentFilterAction = createAction<ISetPermanentFilterActionPayload>(DataTableActionEnums.SetPermanentFilter);

export const changeSelectedIdsAction = createAction<string[]>(DataTableActionEnums.ChangeSelectedIds);

export interface IRegisterConfigurableColumnsPayload {
  /** owner of the columns list, not used now and may be removed later */
  ownerId: string;
  columns: IConfigurableColumnsProps[];
}
export const registerConfigurableColumnsAction = createAction<IRegisterConfigurableColumnsPayload>(DataTableActionEnums.RegisterConfigurableColumns);

export const onSortAction = createAction<IColumnSorting[]>(DataTableActionEnums.OnSort);

export const onGroupAction = createAction<ISortingItem[]>(DataTableActionEnums.OnGroup);

/* NEW_ACTION_GOES_HERE */

export const changeDisplayColumnAction = createAction<string>(DataTableActionEnums.ChangeDisplayColumn);

export const changePersistedFiltersToggleAction = createAction<boolean>(DataTableActionEnums.ChangePersistedFiltersToggle);

export const setDataFetchingModeAction = createAction<DataFetchingMode>(DataTableActionEnums.SetDataFetchingMode);

export interface IFetchGroupingColumnsSuccessPayload {
  grouping: GroupingItem[];
  columns: DataTableColumnDto[];
}
export const fetchGroupingColumnsSuccessAction = createAction<IFetchGroupingColumnsSuccessPayload>(DataTableActionEnums.FetchGroupingColumnsSuccess);

export interface ISortingSettingsActionPayload {
  sortMode?: SortMode | undefined;
  strictSortBy?: string | undefined;
  strictSortOrder?: ColumnSorting | undefined;
  allowReordering: boolean;
}
export const setSortingSettingsAction = createAction<ISortingSettingsActionPayload>(DataTableActionEnums.SetSortingSettings);

export const setStandardSortingAction = createAction<IColumnSorting[]>(DataTableActionEnums.SetStandardSorting);

export const setContextValidationAction = createAction<IModelValidation | undefined>(DataTableActionEnums.SetContextValidation);

export const toggleAdvancedFilterAction = createAction<boolean>(DataTableActionEnums.ToggleAdvancedFilter);
export const toggleColumnsSelectorAction = createAction<boolean>(DataTableActionEnums.ToggleColumnsSelector);
