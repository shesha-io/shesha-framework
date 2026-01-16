import React, { useMemo } from 'react';
import { UnorderedListOutlined } from "@ant-design/icons";
import { IToolboxComponent } from "@/interfaces";
import { useDataSources } from '@/providers/dataSourcesProvider';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IDataListComponentProps } from './model';
import DataListControl, { DataListPlaceholder } from './dataListControl';
import { useDataTableStore } from '@/providers';
import { migrateNavigateAction } from '@/designer-components/_common-migrations/migrate-navigate-action';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { useComponentValidation } from '@/providers/validationErrors';
import { useFormState } from '@/providers/form';

const DataListComponent: IToolboxComponent<IDataListComponentProps> = {
  type: 'datalist',
  isInput: true,
  name: 'DataList',
  icon: <UnorderedListOutlined />,
  Factory: ({ model }) => {
    const ds = useDataSources();
    const dts = useDataTableStore(false);
    const { formMode } = useFormState();

    const dataSource = model.dataSource
      ? ds.getDataSource(model.dataSource)?.dataSource
      : dts;

    const hasDataSource = Boolean(dataSource);
    const isRuntime = formMode === 'readonly' || formMode === 'edit';
    const validationError = useMemo(() => ({
      hasErrors: true,
      validationType: 'error' as const,
      errors: [{
        propertyName: 'Missing Required Parent Component',
        error: 'CONFIGURATION ERROR: Data List requires either a configured Data Source property or placement inside a Data Context component.',
      }],
    }), []);

    // CRITICAL: Register validation errors - FormComponent will display them
    // Only register validation in runtime mode (not during design/dragging)
    // Component identity is automatically obtained from FormComponentValidationProvider
    useComponentValidation(
      () => {
        // Skip validation in designer mode to prevent loops during drag operations
        if (!isRuntime) return undefined;

        return hasDataSource ? undefined : validationError;
      },
      [hasDataSource, validationError, isRuntime],
    );

    if (model.hidden) return null;

    // If no dataSource, show placeholder - validation error will be shown by parent FormComponent
    if (!dataSource) return <DataListPlaceholder />;

    return <DataListControl {...model} dataSourceInstance={dataSource} />;
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
};

export default DataListComponent;
