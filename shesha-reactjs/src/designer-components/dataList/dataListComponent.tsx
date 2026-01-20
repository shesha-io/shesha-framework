import React from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl from './dataListControl';
import { useDataTableStore } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  isInput: true,
  name: 'DataList',
  icon: <UnorderedListOutlined />,
  Factory: ({ model }) => {
    const ds = useDataSources();
    const dts = useDataTableStore(false);

    const dataSource = model.dataSource
      ? ds.getDataSource(model.dataSource)?.dataSource
      : dts;

    // Check if there's a real data source available
    // In designer mode, if no data source is configured and none is available from context, show error
    if (model.hidden) return null;

    return (
      <DataListControl
        {...model}
        dataSourceInstance={dataSource ?? null}
      />
    );
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
        dblClickActionConfiguration: prev['actionConfiguration'],
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
        desktop: { ...prev.desktop,
          gap: prev.cardSpacing,
          dimensions: {
            ...prev.desktop?.dimensions,
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
  settingsFormMarkup: getSettings,
  validateModel: (model, addModelError) => {
    // Validate form configuration
    if (model.formSelectionMode === "name") {
      if (!model.formId) {
        addModelError('formId', 'This Data List has no form selected. Selecting a Form tells the Data List what data structure it should use when rendering items.');
      } else if (typeof model.formId === 'object' && (!model.formId.name || model.formId.name.trim() === '')) {
        addModelError('formId', 'This Data List has an invalid form selected (empty form name). Please select a valid form.');
      }
    }

    if (model.formSelectionMode === "view" && (!model.formType || model.formType.trim() === '')) {
      addModelError('formType', 'This Data List has no form type specified. Selecting a Form Type tells the Data List what data structure it should use when rendering items.');
    }

    if (model.formSelectionMode === "expression" && (!model.formIdExpression || model.formIdExpression.trim() === '')) {
      addModelError('formIdExpression', 'This Data List has no form identifier expression configured. Configuring an expression tells the Data List how to dynamically determine which form to use.');
    }

    // Note: DataContext validation is handled via useComponentValidation hook in the Factory/Control functions
  },
};

export default DataListComponent;
