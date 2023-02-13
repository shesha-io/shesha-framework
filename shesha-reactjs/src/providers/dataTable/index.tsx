import React, { FC, useContext, PropsWithChildren, useEffect, useRef, useMemo } from 'react';
import useThunkReducer from 'react-hook-thunk-reducer';
import { dataTableReducer } from './reducer';
import axios from 'axios';
import FileSaver from 'file-saver';
import {
  DataTableActionsContext,
  DataTableStateContext,
  DATA_TABLE_CONTEXT_INITIAL_STATE,
  IDataTableStateContext,
  IDataTableUserConfig,
  DEFAULT_DT_USER_CONFIG,
} from './contexts';
import { getFlagSetters } from '../utils/flagsSetters';
import {
  fetchTableDataAction,
  fetchTableDataSuccessAction,
  fetchTableDataErrorAction,
  setCurrentPageAction,
  changePageSizeAction,
  toggleColumnVisibilityAction,
  toggleColumnFilterAction,
  changeFilterOptionAction,
  changeFilterAction,
  applyFilterAction,
  changeQuickSearchAction,
  toggleSaveFilterModalAction,
  exportToExcelRequestAction,
  exportToExcelSuccessAction,
  exportToExcelErrorAction,
  /* NEW_ACTION_IMPORT_GOES_HERE */
  changeUserConfigIdAction,
  changeSelectedRowAction,
  changeSelectedStoredFilterIdsAction,
  setPredefinedFiltersAction,
  changeSelectedIdsAction,
  registerConfigurableColumnsAction,
  fetchColumnsSuccessSuccessAction,
  onSortAction,
  changeDisplayColumnAction,
  changeActionedRowAction,
  changePersistedFiltersToggleAction,
  exportToExcelWarningAction,
} from './actions';
import {
  ITableDataInternalResponse,
  ITableDataResponse,
  IndexColumnFilterOption,
  IGetDataPayloadInternal,
  ColumnFilter,
  IFilterItem,
  IStoredFilter,
  ITableFilter,
  IColumnSorting,
  DataTableColumnDtoListAjaxResponse,
  GetColumnsInput,
  IGetDataPayload,
  ITableColumn,
  IExportExcelPayload,
  IExcelColumn,
} from './interfaces';
import { isEmpty, isEqual, sortBy } from 'lodash';
import { IResult } from '../../interfaces/result';
import { useLocalStorage } from '../../hooks';
import { useDebouncedCallback } from 'use-debounce';
import {
  IConfigurableColumnsBase,
  IConfigurableColumnsProps,
  IDataColumnsProps,
} from '../datatableColumnsConfigurator/models';
import { useSheshaApplication } from '../sheshaApplication';
import { useGlobalState } from '../globalState';
import camelCaseKeys from 'camelcase-keys';
import qs from 'qs';
import { advancedFilter2JsonLogic } from './utils';
import { camelcaseDotNotation, convertDotNotationPropertiesToGraphQL } from '../form/utils';
import { GENERIC_ENTITIES_ENDPOINT } from '../../constants';
import { useConfigurableAction } from '../configurableActionsDispatcher';

interface IDataTableProviderProps {
  /** Type of entity */
  entityType: string;
  /** Configurable columns. Is used in pair with entityType  */
  configurableColumns?: IConfigurableColumnsBase[];

  /** Id of the user config, is used for saving of the user settings (sorting, paging etc) to the local storage. */
  userConfigId?: string;

  /**
   * Used for storing the data table state in the global store and publishing and listening to events
   * If not provided, the state will not be saved globally and the user cannot listen to and publish events
   */
  actionOwnerId?: string;
  actionOwnerName?: string;

  /** Table title */
  title?: string;

  /** Id of the parent entity */
  parentEntityId?: string;

  /**
   * @deprecated pass this on an `IndexTable` level
   */
  onDblClick?: (data: any) => void;

  /**
   * @deprecated pass this on an `IndexTable` level
   */
  onSelectRow?: (index: number, row: any) => void;

  /**
   * Called when fetch data or refresh is complete is complete
   */
  onFetchDataSuccess?: () => void;

  /**
   * @deprecated pass this on an `IndexTable` level
   */
  selectedRow?: any;
  getDataPath?: string;
  getExportToExcelPath?: string;
  defaultFilter?: IFilterItem[];
}

const DataTableProvider: FC<PropsWithChildren<IDataTableProviderProps>> = ({
  children,
  userConfigId,
  title,
  parentEntityId,
  onDblClick,
  onSelectRow,
  selectedRow,
  getDataPath,
  getExportToExcelPath,
  defaultFilter,
  entityType,
  configurableColumns,
  actionOwnerId,
  actionOwnerName,
  onFetchDataSuccess,
}) => {
  const [state, dispatch] = useThunkReducer(dataTableReducer, {
    ...DATA_TABLE_CONTEXT_INITIAL_STATE,
    entityType,
    configurableColumns: configurableColumns ?? [],
    title,
    parentEntityId,
  });

  const { setState: setGlobalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();
  const tableIsReady = useRef(false);
  const { httpHeaders: headers } = useSheshaApplication();

  const fetchDataTableDataInternal = (getDataPayload: IGetDataPayload) => {
    const getDataUrl = `${backendUrl}${getDataPath || `${GENERIC_ENTITIES_ENDPOINT}/GetAll`}?${qs.stringify(
      getDataPayload
    )}`;

    return axios({
      url: getDataUrl,
      method: 'GET',
      headers,
    }).then(response => response.data as IResult<ITableDataResponse>);
  };

  const expandFetchDataPayload = (
    payload: IGetDataPayloadInternal,
    providedState: IDataTableStateContext
  ): IGetDataPayloadInternal => {
    // convert filters
    const allFilters = providedState?.predefinedFilters || [];

    let skipFetch = false;

    const filters = payload.selectedFilterIds.map(id => allFilters.find(f => f.id === id)).filter(f => Boolean(f));

    const expandedPayload: IGetDataPayloadInternal = { ...payload, selectedFilters: filters };

    // Check against state.selectedStoredFilterIds as well
    if (filters?.length === 0 && providedState?.predefinedFilters?.length) {
      const foundSelectedFilter = providedState?.predefinedFilters?.find(({ defaultSelected }) => defaultSelected);

      if (foundSelectedFilter) {
        expandedPayload.selectedFilterIds = [foundSelectedFilter?.id];
        expandedPayload.selectedFilters = [foundSelectedFilter];
      }
    }

    //Make sure you don't query the data for a selected filter that has no expression
    const outgoingSelectedFilterId = expandedPayload?.selectedFilterIds?.length
      ? expandedPayload?.selectedFilterIds[0]
      : null;

    if (outgoingSelectedFilterId) {
      const foundFilter = expandedPayload?.selectedFilters?.find(({ id }) => id === outgoingSelectedFilterId);

      /**
       * We want to make sure that we do not pass the filters under the following conditions as they would cause the server to fail
       * 1. The filter has no expression
       * 2. Filter has an expression but not all dynamic expressions have been evaluated
       */

      if (
        foundFilter &&
        (!foundFilter?.expression || // Filter has no expression
          foundFilter?.unevaluatedExpressions?.length) // Filter has expression but not all expressions have been evaluated
      ) {
        if (foundFilter?.unevaluatedExpressions?.length && foundFilter?.onlyFetchWhenFullyEvaluated) {
          // Do not fetch if this condition is true
          skipFetch = true;
        }

        expandedPayload.selectedFilterIds = [];
        expandedPayload.selectedFilters = [];
      }
    }

    return { ...expandedPayload, skipFetch };
  };

  const convertFilters = (internalPayload: IGetDataPayloadInternal): string => {
    let allFilters = [];
    if (internalPayload.selectedFilters && internalPayload.selectedFilters.length > 0) {
      internalPayload.selectedFilters.forEach(f => {
        if (f.expression) {
          const jsonLogic = typeof f.expression === 'string' ? JSON.parse(f.expression) : f.expression;

          allFilters.push(jsonLogic);
        }
      });
    }

    const advancedFilter = advancedFilter2JsonLogic(internalPayload.advancedFilter, state.columns);

    if (advancedFilter && advancedFilter.length > 0) allFilters = allFilters.concat(advancedFilter);

    if (allFilters.length === 0) return null;

    const jsonLogicFilters = allFilters.length === 1 ? allFilters[0] : { and: allFilters };

    // console.log('allFilters', allFilters);
    // console.log('jsonLogicFilters', jsonLogicFilters);

    return JSON.stringify(jsonLogicFilters);
  };

  const getFetchDataPayload = (internalPayload: IGetDataPayloadInternal, columns: ITableColumn[]): IGetDataPayload => {
    const payload: IGetDataPayload = {
      entityType: entityType,
      maxResultCount: internalPayload.pageSize,
      skipCount: (internalPayload.currentPage - 1) * internalPayload.pageSize,
      properties: convertDotNotationPropertiesToGraphQL(internalPayload.properties, columns),
      quickSearch: internalPayload.quickSearch,
      sorting: internalPayload.sorting
        .filter(s => Boolean(s.id))
        .map(s => camelcaseDotNotation(s.id) + (s.desc ? ' desc' : ''))
        .join(','),
      filter: convertFilters(internalPayload),
    };

    return payload;
  };

  const convertDataResponse = (
    response: IResult<ITableDataResponse>,
    pageSize: number
  ): IResult<ITableDataInternalResponse> => {
    if (!response.result) return { ...response, result: null };

    const internalResult: ITableDataInternalResponse = {
      totalRows: response.result.totalCount,
      totalPages: Math.ceil(response.result.totalCount / pageSize),
      rows: response.result.items,
      totalRowsBeforeFilter: 0,
    };

    const internalResponse: IResult<ITableDataInternalResponse> = {
      ...response,
      result: internalResult,
    };

    return internalResponse;
  };

  /**
   * Returns the fetch data table data or null in a case where `skipFetch: true`
   * @param payload
   * @returns Promise<IResult<ITableDataResponse>> or null
   */
  const fetchDataTableData = (
    payload: IGetDataPayloadInternal
  ): Promise<IResult<ITableDataInternalResponse>> | null => {
    // save current user configuration to local storage
    const userConfigToSave: IDataTableUserConfig = {
      ...userDTSettingsInner,
      pageSize: payload.pageSize,
      currentPage: payload.currentPage,
      quickSearch: payload.quickSearch,
      columns: state.columns,
      tableSorting: payload.sorting,
      advancedFilter: payload.advancedFilter,
    };

    setUserDTSettings(userConfigToSave);

    const expandedPayload = expandFetchDataPayload(payload, state);

    if (expandedPayload?.skipFetch) {
      return null;
    }

    const fetchPayload = getFetchDataPayload(expandedPayload, state.columns);

    //console.log('DT fetch', { payload, expandedPayload, fetchPayload })

    return fetchDataTableDataInternal(fetchPayload).then(response => convertDataResponse(response, payload.pageSize));
  };

  const [userDTSettingsInner, setUserDTSettings] = useLocalStorage<IDataTableUserConfig>(
    userConfigId,
    null
    // ['selectedStoredFilterIds'] // TODO: Review the saving of selected filters
  );

  const userDTSettings = useMemo(() => {
    const settingsToReturn: IDataTableUserConfig = defaultFilter
      ? { ...DEFAULT_DT_USER_CONFIG, advancedFilter: defaultFilter }
      : userDTSettingsInner;

    return {
      ...settingsToReturn,
    };
  }, [defaultFilter, userDTSettingsInner]);

  useEffect(() => {
    if (userConfigId && userConfigId !== state.userConfigId) {
      dispatch(changeUserConfigIdAction(userConfigId));
    }
  }, [userConfigId]);

  // fetch table data when config is ready or something changed (selected filter, changed current page etc.)
  useEffect(() => {
    if (entityType) {
      // fecth using entity type
      tableIsReady.current = true; // is used to prevent unneeded data fetch by the ReactTable. Any data fetch requests before this line should be skipped
      refreshTable();
    }
  }, [
    state.tableFilter /*?.length*/,
    state.currentPage,
    state.selectedStoredFilterIds,
    state.selectedPageSize,
    state.tableConfigLoaded,
    state.entityType,
    state.columns?.length,
    state.tableSorting,
  ]);

  // fetch table data when config is ready or something changed (selected filter, changed current page etc.)
  const refreshTableWhenAppropriate = () => {
    if (entityType) {
      // fecth using entity type
      tableIsReady.current = true; // is used to prevent unneeded data fetch by the ReactTable. Any data fetch requests before this line should be skipped
      refreshTable();
    }
  };

  // const previousPredefinedFilters = usePrevious(state.predefinedFilters);

  const debouncedRefreshTable = useDebouncedCallback(() => {
    refreshTableWhenAppropriate();
  }, 500);

  useEffect(() => {
    if (state.predefinedFilters) {
      debouncedRefreshTable();
    }
  }, [state.predefinedFilters]);

  const refreshTable = () => {
    if (columnsAreReady && tableIsReady.current === true) {
      fetchTableData();
    }
  };

  const debouncedFetch = useDebouncedCallback(
    (payload: IGetDataPayloadInternal) => {
      const fetchDataFunc = fetchDataTableData(payload);

      const finishFetching = () => {
        if (onFetchDataSuccess && typeof onFetchDataSuccess === 'function') {
          onFetchDataSuccess();
        }
      };

      if (fetchDataFunc === null) {
        finishFetching();

        dispatch(
          fetchTableDataSuccessAction({
            totalPages: 0,
            totalRows: 0,
            totalRowsBeforeFilter: 0,
            rows: [],
          })
        );
        return;
      }

      fetchDataFunc
        .then(data => {
          finishFetching();

          dispatch(fetchTableDataSuccessAction(data.result));
        })
        .catch(e => {
          console.log(e);
          dispatch(fetchTableDataErrorAction());
        });
    },
    // delay in ms
    300
  );

  const debouncedExportToExcel = useDebouncedCallback(
    () => {
      exportToExcel();
    },
    // delay in ms
    300
  );

  const columnsAreReady = entityType && state?.columns?.length > 0;

  const fetchTableData = (payload?: IGetDataPayloadInternal) => {
    const internalPayload = {
      ...getFetchTableDataPayload(),
      ...(payload ?? {}),
      parentEntityId,
    };

    // note: we have two sources of the payload - ReactTable and our provider
    // so we have to save the payload on every fetch request but skip data fetch in some cases
    dispatch(fetchTableDataAction(internalPayload)); // todo: remove this line, it's needed just to save the Id

    if (columnsAreReady && tableIsReady.current === true) {
      debouncedFetch(internalPayload);
    }
  };

  useEffect(() => {
    // Save the settings whenever the columns change
    if (!isEmpty(userDTSettings) && state?.columns?.length > 0) {
      setUserDTSettings({
        ...userDTSettings,
        selectedFilterIds: state?.selectedStoredFilterIds,
        columns: state?.columns,
      });
    }
  }, [state?.columns]);

  const getFetchTableDataPayloadInternal = (localState: IDataTableStateContext): IGetDataPayloadInternal => {
    // Add default filter to table filter
    const filter = localState?.tableFilter || [];

    const localProperties = getDataProperties(localState.configurableColumns);

    const payload: IGetDataPayloadInternal = {
      entityType,
      properties: localProperties,
      pageSize: localState.selectedPageSize,
      currentPage: localState.currentPage,
      sorting: localState.tableSorting,
      quickSearch: localState.quickSearch,
      advancedFilter: filter, //state.tableFilter,
      parentEntityId,
      selectedFilterIds: localState.selectedStoredFilterIds || [],
    };
    return payload;
  };

  const getFetchTableDataPayload = (): IGetDataPayloadInternal => {
    return getFetchTableDataPayloadInternal(state);
  };

  const exportToExcel = () => {
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(exportToExcelRequestAction());
      const currentState = getState();
      const payload = getFetchTableDataPayloadInternal(currentState);

      const expandedPayload = expandFetchDataPayload(payload, currentState);

      dispatchThunk(exportToExcelWarningAction(null));

      if (expandedPayload.skipFetch) {
        dispatchThunk(
          exportToExcelWarningAction('Could not export to excel because not all filters have been fully evaluated')
        );

        return;
      }
      const getDataPayload = getFetchDataPayload(expandedPayload, currentState.columns);
      let excelColumns = currentState.columns
        .filter(c => c.dataType !== 'action')
        .map<IExcelColumn>(c => ({ propertyName: c.propertyName, label: c.caption }));

      if (excelColumns.findIndex(c => c.propertyName == 'id') === -1) {
        excelColumns = [{ propertyName: 'id', label: 'Id' }, ...excelColumns];
      }

      const excelPayload: IExportExcelPayload = {
        ...getDataPayload,
        maxResultCount: 2147483647,
        columns: excelColumns,
      };

      const excelEndpoint = getExportToExcelPath || `${GENERIC_ENTITIES_ENDPOINT}/ExportToExcel`;
      const excelDataUrl = `${backendUrl}${excelEndpoint}`;

      axios({
        url: excelDataUrl,
        method: 'POST',
        data: excelPayload,
        responseType: 'blob', // important
        headers,
      })
        .then(response => {
          dispatchThunk(exportToExcelSuccessAction());
          FileSaver.saveAs(new Blob([response.data]), 'Export.xlsx');
        })
        .catch(() => {
          dispatchThunk(exportToExcelErrorAction('There was an error exporting data to excel'));
        });
    });
  };

  const setCurrentPage = (val: number) => {
    dispatch(setCurrentPageAction(val));
  };

  const changePageSize = (val: number) => {
    dispatch(changePageSizeAction(val));
  };

  const toggleColumnVisibility = (columnId: string) => {
    dispatch(toggleColumnVisibilityAction(columnId));
  };

  const changeFilterOption = (filterColumnId: string, filterOptionValue: IndexColumnFilterOption) =>
    dispatch(changeFilterOptionAction({ filterColumnId, filterOptionValue }));

  const changeFilter = (filterColumnId: string, filterValue: ColumnFilter) =>
    dispatch(changeFilterAction({ filterColumnId, filterValue }));

  const applyFilters = () => {
    const { tableFilterDirty } = state;

    dispatch(applyFilterAction(tableFilterDirty));
  };

  /** change quick search text without refreshing of the table data */
  const changeQuickSearch = (val: string) => {
    dispatch(changeQuickSearchAction(val));
  };

  /** change quick search and refresh table data */
  const performQuickSearch = (val: string) => {
    // note: use thunk to get state after update
    dispatch((dispatchThunk, getState) => {
      dispatchThunk(changeQuickSearchAction(val));
      dispatchThunk(setCurrentPageAction(1));

      const payload = getFetchTableDataPayloadInternal(getState());
      fetchTableData(payload);
    });
  };

  const toggleSaveFilterModal = (visible: boolean) => {
    dispatch(toggleSaveFilterModalAction(visible));
  };

  const clearFilters = () => {
    if (Boolean(userDTSettings)) {
      const newUserSTSettings = { ...userDTSettings, selectedStoredFilterIds: state?.selectedStoredFilterIds };
      delete newUserSTSettings.pageSize;
      delete newUserSTSettings.currentPage;
      delete newUserSTSettings.quickSearch;
      delete newUserSTSettings.advancedFilter;

      setUserDTSettings(newUserSTSettings);
    }

    dispatch(toggleColumnFilterAction([]));
    dispatch(applyFilterAction([]));
  };

  const toggleColumnFilter = (ids: string[]) => {
    if (ids?.length) {
      dispatch(toggleColumnFilterAction(ids));
    } else {
      clearFilters();
    }
  };

  const changeSelectedRow = (val: any) => {
    dispatch(changeSelectedRowAction(val ? camelCaseKeys(val, { deep: true }) : null));
  };

  const changeActionedRow = (val: any) => {
    dispatch(changeActionedRowAction(val ? camelCaseKeys(val, { deep: true }) : null));
  };

  const changeSelectedStoredFilterIds = (selectedFilterIds: string[]) => {
    setUserDTSettings({ ...userDTSettings, selectedFilterIds });

    dispatch(changeSelectedStoredFilterIdsAction(selectedFilterIds));
  };

  const setPredefinedFilters = (predefinedFilters: IStoredFilter[]) => {
    const filtersChanged = !isEqual(sortBy(state?.predefinedFilters), sortBy(predefinedFilters));

    if (filtersChanged) {
      dispatch(setPredefinedFiltersAction({ predefinedFilters, userConfigId }));
    }
  };

  const changeSelectedIds = (selectedIds: string[]) => {
    dispatch(changeSelectedIdsAction(selectedIds));
  };

  const getDataProperties = (columns: IConfigurableColumnsBase[]) => {
    const dataFields = columns.filter(
      c =>
        c.itemType === 'item' &&
        (c as IConfigurableColumnsProps).columnType === 'data' &&
        Boolean((c as IDataColumnsProps).propertyName)
    ) as IDataColumnsProps[];

    return dataFields.map(f => f.propertyName);
  };

  const properties = useMemo(() => {
    const dataFields = state?.configurableColumns?.filter(
      c =>
        c.itemType === 'item' &&
        (c as IConfigurableColumnsProps).columnType === 'data' &&
        Boolean((c as IDataColumnsProps).propertyName)
    ) as IDataColumnsProps[];

    return dataFields.map(f => f.propertyName);
  }, [state?.configurableColumns]);

  useEffect(() => {
    const { configurableColumns } = state;
    if (!entityType) return;

    const localProperties = getDataProperties(configurableColumns);

    if (localProperties.length === 0) {
      // don't fetch data from server when properties is empty
      dispatch(fetchColumnsSuccessSuccessAction({ columns: [], configurableColumns, userConfig: userDTSettings }));
      return;
    }

    // fetch columns config from server
    const getColumnsPayload: GetColumnsInput = {
      entityType,
      properties: localProperties,
    };

    axios({
      method: 'POST',
      url: `${backendUrl}/api/services/app/DataTable/GetColumns`,
      data: getColumnsPayload,
      headers,
    })
      .then(response => {
        const responseData = response.data as DataTableColumnDtoListAjaxResponse;

        if (responseData.success) {
          dispatch(
            fetchColumnsSuccessSuccessAction({
              columns: responseData.result,
              configurableColumns,
              userConfig: userDTSettings,
            })
          );
        }
      })
      .catch(e => {
        console.log(e);
      });
  }, [state.configurableColumns, state.entityType]);

  const registerConfigurableColumns = (ownerId: string, columns: IConfigurableColumnsBase[]) => {
    dispatch(registerConfigurableColumnsAction({ ownerId, columns }));
  };

  const getCurrentFilter = (): ITableFilter[] => {
    return state.tableFilterDirty || state.tableFilter || [];
  };

  const onSort = (sorting: IColumnSorting[]) => {
    dispatch(onSortAction(sorting));
  };

  const flagSetters = getFlagSetters(dispatch);

  //#region public
  const deleteRow = () => {
    console.log(`deleteRow ${state?.selectedRow}`);
  };

  const toggleColumnsSelector = () => {
    flagSetters?.setIsInProgressFlag({ isSelectingColumns: true, isFiltering: false });
  };

  const toggleAdvancedFilter = () => {
    flagSetters?.setIsInProgressFlag({ isFiltering: true, isSelectingColumns: false });
  };

  const changeDisplayColumn = (displayColumnName: string) => {
    dispatch(changeDisplayColumnAction(displayColumnName));
  };

  const changePersistedFiltersToggle = (persistSelectedFilters: boolean) => {
    dispatch(changePersistedFiltersToggleAction(persistSelectedFilters));
  };

  //#endregion

  //#region Subscriptions
  useEffect(() => {
    // write state by name
    if (actionOwnerName) {
      setGlobalState({
        key: actionOwnerName,
        data: { ...state, refreshTable },
      });
    }
  }, [state, actionOwnerName]);

  useConfigurableAction(
    {
      name: 'Refresh table',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        refreshTable(); // todo: return correct promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Delete row',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        deleteRow(); // todo: return correct promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Export to Excel',
      description: 'Export current table view to Excel',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        debouncedExportToExcel(); // return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Toggle Advanced Filter',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        toggleAdvancedFilter(); // return real promise
        return Promise.resolve();
      },
    },
    [state]
  );

  useConfigurableAction(
    {
      name: 'Toggle Columns Selector',
      owner: actionOwnerName,
      ownerUid: actionOwnerId,
      hasArguments: false,
      executer: () => {
        toggleColumnsSelector(); // return real promise
        return Promise.resolve();
      },
    },
    [state]
  );
  //#endregion

  /* NEW_ACTION_DECLARATION_GOES_HERE */

  return (
    <DataTableStateContext.Provider value={{ ...state, onDblClick, onSelectRow, selectedRow, properties }}>
      <DataTableActionsContext.Provider
        value={{
          onSort,
          ...flagSetters,
          changeDisplayColumn,
          fetchTableData,
          setCurrentPage,
          changePageSize,
          toggleColumnVisibility,
          toggleColumnFilter,
          changeFilterOption,
          changeFilter,
          applyFilters,
          clearFilters,
          getDataPayload: getFetchTableDataPayload,
          exportToExcel,
          changeQuickSearch,
          performQuickSearch,
          toggleSaveFilterModal,
          changeSelectedRow,
          changeActionedRow,
          changeSelectedStoredFilterIds,
          setPredefinedFilters,
          changeSelectedIds,
          refreshTable,
          registerConfigurableColumns,
          getCurrentFilter,
          changePersistedFiltersToggle,
          /* NEW_ACTION_GOES_HERE */
        }}
      >
        {children}
      </DataTableActionsContext.Provider>
    </DataTableStateContext.Provider>
  );
};

function useDataTableState() {
  const context = useContext(DataTableStateContext);

  if (context === undefined) {
    throw new Error('useDataTableState must be used within a DataTableProvider');
  }

  return context;
}

function useDataTableActions() {
  const context = useContext(DataTableActionsContext);

  if (context === undefined) {
    throw new Error('useDataTableActions must be used within a DataTableProvider');
  }

  return context;
}

function useDataTableStore() {
  return { ...useDataTableState(), ...useDataTableActions() };
}

const useDataTable = useDataTableStore;

export default DataTableProvider;

export { DataTableProvider, useDataTableState, useDataTableActions, useDataTable, useDataTableStore };
