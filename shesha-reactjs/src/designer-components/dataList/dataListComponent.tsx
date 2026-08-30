import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migrateHiddenToVisible, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl from './dataListControl';
import { useDataTableStoreOrUndefined } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { isConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useComponentApi } from "@/providers/componentApi/hooks";
import { DataListApi } from "@/componentsApi/dataListApi";

import apiCode from "../../componentsApi/dataListApi.ts?raw";
import { migratePermissionsToVisiblePermissions } from "../_common-migrations/migratePermissionsToVisiblePermissions";

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  isInput: true,
  name: 'DataList',
  icon: <UnorderedListOutlined />,
  initModel: (model) => ({ ...model, visible: model.visible ?? true }),
  Factory: ({ model }) => {
    const ds = useDataSources();
    const dts = useDataTableStoreOrUndefined();

    const store = isNullOrWhiteSpace(model.dataSource) ? dts : ds.getDataSource(model.dataSource)?.dataSource;

    // TODO: review validation
    // Check if there's a real data source available
    // In designer mode, if no data source is configured and none is available from context, show error
    if (!isDefined(store))
      throw new Error('No data source is available for this list');

    const {
      refreshTable: refreshList,
      exportToExcel,
      changeQuickSearch,
      performQuickSearch,
      toggleAdvancedFilter,
      setRowData: setItemData,
      onGroup: group,
      onSort: sort,
      changeSelectedIds,
      clearSelectedRow: clearSelectedItem,
      setCurrentPage,
      changePageSize,
    } = store;

    useComponentApi<DataListApi>({ model, typeName: 'DataListApi',
      typeDefinition: { typeName: 'DataListApi', files: [{ content: apiCode, fileName: 'apis/dataListApi.ts' }] },
      api: { refreshList, exportToExcel, changeQuickSearch, performQuickSearch, toggleAdvancedFilter, setItemData, group, sort, changeSelectedIds, clearSelectedItem, setCurrentPage, changePageSize },
      properties: [
        { name: 'listData', getter: () => store.tableData },
        { name: 'selectedPageSize', getter: () => store.selectedPageSize },
        { name: 'currentPage', getter: () => store.currentPage },
        { name: 'totalPages', getter: () => store.totalPages },
        { name: 'totalItems', getter: () => store.totalRows },
        { name: 'totalItemsBeforeFilter', getter: () => store.totalRowsBeforeFilter },
        { name: 'quickSearch', getter: () => store.quickSearch },
        { name: 'userSorting', getter: () => store.userSorting },
        { name: 'grouping', getter: () => store.grouping },
        { name: 'listFilter', getter: () => store.tableFilter },
        { name: 'selectedStoredFilterIds', getter: () => store.selectedStoredFilterIds },
        { name: 'selectedItem', getter: () =>
          isDefined(store.selectedRow)
            ? { id: store.selectedRow.id, index: store.selectedRow.index, item: store.selectedRow.row }
            : undefined,
        },
        { name: 'selectedIds', getter: () => store.selectedIds },
        { name: 'isFetchingListData', getter: () => store.isFetchingTableData },
        { name: 'selectedItems', getter: () => store.selectedRows },
      ],
    }, [store]);

    if (model.hidden === true) return null;

    return <DataListControl {...model} dataSourceInstance={store} />;
  },
  migrator: (m) => m
    .add<IDataListComponentProps>(0, (prev) => ({
      ...prev,
      formSelectionMode: 'name',
      selectionMode: 'single',
      items: [],
      // Set default form to the starter template
      formId: { name: 'dummy-datalist-item', module: 'Shesha' },
    }))
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
        dblClickActionConfiguration: "actionConfiguration" in prev && isConfigurableActionConfiguration(prev.actionConfiguration) ? prev.actionConfiguration : undefined,
        showEditIcons: true,
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
        desktop: {
          ...prev.desktop,
          gap: prev.cardSpacing,
          dimensions: {
            ...prev.desktop?.dimensions,
            minWidth: prev.cardMinWidth,
            maxWidth: prev.cardMaxWidth,
            width: prev.customWidth,
            height: prev.cardHeight,
          },
        },
      };
    }).add<IDataListComponentProps>(10, (prev) => {
      const cardSpacing = isNullOrWhiteSpace(prev.cardSpacing) ? '0px' : prev.cardSpacing;
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
    .add<IDataListComponentProps>(11, (prev) => ({ ...prev, showEditIcons: true }))
    .add<IDataListComponentProps>(12, (prev) => migratePermissionsToVisiblePermissions(migrateHiddenToVisible(prev))),
  settingsFormMarkup: getSettings,
  validateModel: (model, addModelError) => {
    if (model.formSelectionMode === "name") {
      if (!isDefined(model.formId)) {
        addModelError('formId', 'This Data List has no form selected.\nSelecting a Form tells the Data List what data structure it should use when rendering items.');
      } else if (typeof model.formId === 'string' && model.formId.trim() === '') {
        addModelError('formId', 'This Data List has an invalid form selected (empty form name).\nPlease select a valid form.');
      } else if (typeof model.formId === 'object' && (!model.formId.name || model.formId.name.trim() === '')) {
        addModelError('formId', 'This Data List has an invalid form selected (empty form name).\nPlease select a valid form.');
      }
    }

    if (model.formSelectionMode === "view" && (isNullOrWhiteSpace(model.formType))) {
      addModelError('formType', 'This Data List has no form type specified.\nSelecting a Form Type tells the Data List what data structure it should use when rendering items.');
    }

    if (model.formSelectionMode === "expression" && (isNullOrWhiteSpace(model.formIdExpression))) {
      addModelError('formIdExpression', 'This Data List has no form identifier expression configured.\nConfiguring an expression tells the Data List how to dynamically determine which form to use.');
    }
  },
};

export default DataListComponent;
