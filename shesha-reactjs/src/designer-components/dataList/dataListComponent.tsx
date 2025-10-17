import React, { useMemo } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl from './dataListControl';
import { useDataTableStore, useForm } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { DataTableFullInstance } from '@/providers/dataTable/contexts';

// Mock data source for when datalist is outside a data context
const createMockDataSource = (orientation: string = 'vertical'): DataTableFullInstance => {
  const mockData = orientation === 'vertical' ? [{}] : [{}, {}, {}, {}];

  return {
    // State properties
    succeeded: {},
    isInProgress: {},
    error: {},
    actioned: {},
    tableData: mockData,
    isFetchingTableData: false,
    selectedIds: [],
    selectedRow: null,
    selectedRows: [],
    modelType: null,
    columns: [],
    groupingColumns: [],
    grouping: [],
    dataFetchingMode: 'paging' as const,
    allowReordering: false,
    pageSizeOptions: [5, 10, 20, 30, 40, 50, 100],
    selectedPageSize: 10,
    currentPage: 1,
    totalPages: 1,
    totalRows: mockData.length,
    quickSearch: '',
    standardSorting: [],
    userSorting: [],
    sortMode: 'standard' as const,
    persistSelectedFilters: false,
    configurableColumns: [],
    predefinedFilters: [],
    tableFilter: [],
    selectedStoredFilterIds: [],
    properties: [],

    // Action properties - Mock implementations (no-op)
    changeSelectedIds: () => { /* mock implementation */ },
    getRepository: () => null,
    setRowData: () => { /* mock implementation */ },
    setSelectedRow: () => { /* mock implementation */ },
    setMultiSelectedRow: () => { /* mock implementation */ },
    refreshTable: () => { /* mock implementation */ },
    registerConfigurableColumns: () => { /* mock implementation */ },
    requireColumns: () => { /* mock implementation */ },
    registerDataFetchDependency: () => { /* mock implementation */ },
    unregisterDataFetchDependency: () => { /* mock implementation */ },
    changeDisplayColumn: () => { /* mock implementation */ },
    changePersistedFiltersToggle: () => { /* mock implementation */ },
    setDragState: () => { /* mock implementation */ },
    setColumnWidths: () => { /* mock implementation */ },
    toggleColumnVisibility: () => { /* mock implementation */ },
    setCurrentPage: () => { /* mock implementation */ },
    changePageSize: () => { /* mock implementation */ },
    toggleColumnFilter: () => { /* mock implementation */ },
    removeColumnFilter: () => { /* mock implementation */ },
    changeFilterOption: () => { /* mock implementation */ },
    changeFilter: () => { /* mock implementation */ },
    applyFilters: () => { /* mock implementation */ },
    clearFilters: () => { /* mock implementation */ },
    changeQuickSearch: () => { /* mock implementation */ },
    performQuickSearch: () => { /* mock implementation */ },
    toggleSaveFilterModal: () => { /* mock implementation */ },
    changeActionedRow: () => { /* mock implementation */ },
    changeSelectedStoredFilterIds: () => { /* mock implementation */ },
    setPredefinedFilters: () => { /* mock implementation */ },
    setPermanentFilter: () => { /* mock implementation */ },
    onSort: () => { /* mock implementation */ },
    onGroup: () => { /* mock implementation */ },
    getCurrentFilter: () => [],
    setIsInProgressFlag: () => { /* mock implementation */ },
    setSucceededFlag: () => { /* mock implementation */ },
    setFailedFlag: () => { /* mock implementation */ },
    setActionedFlag: () => { /* mock implementation */ },
    resetIsInProgressFlag: () => { /* mock implementation */ },
    resetSucceededFlag: () => { /* mock implementation */ },
    resetFailedFlag: () => { /* mock implementation */ },
    resetActionedFlag: () => { /* mock implementation */ },
    resetAllFlag: () => { /* mock implementation */ },
  };
};

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  isInput: true,
  name: 'DataList',
  icon: <UnorderedListOutlined />,
  Factory: ({ model }) => {
    const ds = useDataSources();
    const dts = useDataTableStore(false);
    const { formMode } = useForm();
    const isDesignerMode = formMode === 'designer';


    const mockDataSource = useMemo(() => createMockDataSource(model.orientation), [model.orientation]);

    if (model.hidden) return null;

    const dataSource = model.dataSource
      ? ds.getDataSource(model.dataSource)?.dataSource
      : dts;

    // If no data source, show mock data in designer mode
    if (!dataSource && isDesignerMode) {
      return <DataListControl {...model} dataSourceInstance={mockDataSource} />;
    }

    // If no data source in live mode, show warning (but this should be handled differently)
    if (!dataSource) {
      return <DataListControl {...model} dataSourceInstance={mockDataSource} />;
    }

    return <DataListControl {...model} dataSourceInstance={dataSource} />;
  },
  migrator: (m) => m
    .add<IDataListComponentProps>(0, (prev) => ({ ...prev, formSelectionMode: 'name', selectionMode: 'none', items: [] }))
    .add<IDataListComponentProps>(1, (prev) => ({ ...prev, orientation: 'vertical', listItemWidth: 1 }))
    .add<IDataListComponentProps>(2, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IDataListComponentProps>(3, (prev) => migrateVisibility(prev))
    .add<IDataListComponentProps>(4, (prev) => ({ ...prev, collapsible: true }))
    .add<IDataListComponentProps>(5, (prev) => {
      return {
        ...prev,
        canAddInline: 'no',
        canEditInline: 'no',
        canDeleteInline: 'no',
        inlineEditMode: 'one-by-one',
        inlineSaveMode: 'manual',
        dblClickActionConfiguration: prev['actionConfiguration'],

      };
    })
    .add<IDataListComponentProps>(6, (prev) => ({ ...prev, dblClickActionConfiguration: migrateNavigateAction(prev.dblClickActionConfiguration) }))
    .add<IDataListComponentProps>(7, (prev: IDataListComponentProps) => ({
      ...migrateFormApi.properties(prev),
      onNewListItemInitialize: migrateFormApi.full(prev.onNewListItemInitialize),
      onListItemSave: migrateFormApi.full(prev.onListItemSave),
    }))
    .add<IDataListComponentProps>(8, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
    .add<IDataListComponentProps>(9, (prev) => {
      return {
        ...prev,
        desktop: { ...prev.desktop,
          gap: prev.cardSpacing,
          dimensions: {
            ...prev.desktop.dimensions,
            minWidth: prev.cardMinWidth,
            maxWidth: prev.cardMaxWidth,
            width: prev.customWidth,
            height: prev.cardHeight,
          } },
      };
    }).add<IDataListComponentProps>(10, (prev) => {
      const cardSpacing = prev.cardSpacing || '0px';
      const parsedGap = parseInt(cardSpacing.replace('px', ''), 10);
      const gap = isNaN(parsedGap) ? 0 : parsedGap;

      return {
        ...prev,
        orientation: prev.orientation,
        desktop: {
          ...prev.desktop,
          gap: gap,
          orientation: prev.orientation,
          dimensions: {
            minWidth: prev.cardMinWidth ?? 'auto',
            maxWidth: prev.cardMaxWidth ?? 'auto',
            width: prev.customWidth ?? prev.cardMaxWidth ?? 'auto',
            height: prev.cardHeight ?? 'auto',
            minHeight: 'auto',
            maxHeight: 'auto',
          },
        },
      };
    })
    .add<IDataListComponentProps>(11, (prev) => ({ ...prev, showEditIcons: true })),
  settingsFormMarkup: (data) => getSettings(data),
};

export default DataListComponent;
