import React, { CSSProperties, useMemo } from 'react';
import { GlobalTableFilter } from '@/components';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { SearchOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './tabbedSettingsForm';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import Search from 'antd/lib/input/Search';
import { useDataTableStore } from '@/index';
import { useStyles } from '../tableContext/styles';
import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { IQuickSearchComponentProps, QuickSearchComponentDefinition } from './interfaces';
import { useComponentValidation } from '@/providers/validationErrors';
import { useFormState } from '@/providers/form';

const QuickSearchComponent: QuickSearchComponentDefinition = {
  type: 'datatable.quickSearch',
  isInput: false,
  name: 'Quick Search',
  icon: <SearchOutlined />,
  Factory: ({ model }) => {
    const { block, hidden, dimensions, size: modelSize } = model;
    const store = useDataTableStore(false);
    const { styles } = useStyles();
    const { formMode } = useFormState();
    const dimensionsStyles = useMemo(() => getDimensionsStyle(dimensions), [dimensions]);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...dimensionsStyles,
    });
    const finalStyle = removeUndefinedProps({
      ...additionalStyles,
      // Ensure consistent width when outside DataTableContext
      ...(store ? {} : { width: additionalStyles.width ?? '360px' }),
    });

    const hasStore = Boolean(store);
    const isRuntime = formMode === 'readonly' || formMode === 'edit';
    const validationError = useMemo(() => ({
      hasErrors: true,
      validationType: 'error' as const,
      errors: [{
        propertyName: 'Missing Required Parent Component',
        error: 'CONFIGURATION ERROR: Quick Search MUST be placed inside a Data Context, Data Table, or Data List component. This component cannot function without a data source.',
      }],
    }), []);

    // CRITICAL: Register validation errors - FormComponent will display them
    // Only register validation in runtime mode (not during design/dragging)
    // Component identity is automatically obtained from FormComponentValidationProvider
    useComponentValidation(
      () => {
        // Skip validation in designer mode to prevent loops during drag operations
        if (!isRuntime) return undefined;

        return hasStore ? undefined : validationError;
      },
      [hasStore, validationError, isRuntime],
    );

    if (hidden) return null;

    return store
      ? (
        <GlobalTableFilter
          block={block}
          style={finalStyle}
          searchProps={{
            size: modelSize,
          }}
        />
      )
      : (
        <div className={styles.quickSearchContainer} style={finalStyle}>
          <Search
            size={modelSize}
            disabled
          />
        </div>
      );
  },
  initModel: (model: IQuickSearchComponentProps) => {
    return {
      ...model,
      items: [],
      size: 'small',
    };
  },
  migrator: (m) =>
    m
      .add(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IQuickSearchComponentProps>(1, (prev) => migrateVisibility(prev))
      .add<IQuickSearchComponentProps>(2, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IQuickSearchComponentProps>(3, (prev) => ({ ...migratePrevStyles(prev, { size: 'small' }) })),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default QuickSearchComponent;
