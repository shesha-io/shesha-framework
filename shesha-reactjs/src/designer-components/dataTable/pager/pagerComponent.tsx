import { TablePager } from '@/components';
import { migrateFormApi } from '@/designer-components/_common-migrations/migrateFormApi1';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migratePrevStyles } from '@/designer-components/_common-migrations/migrateStyles';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { removeUndefinedProps } from '@/utils/object';
import { ControlOutlined } from '@ant-design/icons';
import React, { CSSProperties } from 'react';
import { getSettings } from './settingsForm';
import { defaultStyles } from './utils';
import { IPagerComponentProps, PagerComponentDefinition } from './interfaces';
import { useDataTableStore } from '@/providers';
import { useComponentValidation } from '@/providers/validationErrors';

const PagerComponent: PagerComponentDefinition = {
  type: 'datatable.pager',
  isInput: false,
  name: 'Table Pager',
  icon: <ControlOutlined />,
  Factory: ({ model }) => {
    const { allStyles } = model;
    const jsStyle = allStyles?.jsStyle;
    const fontStyles = allStyles?.fontStyles;
    const stylingBoxAsCSS = allStyles?.stylingBoxAsCSS;
    const store = useDataTableStore(false);

    const additionalStyles: CSSProperties = removeUndefinedProps({
      ...stylingBoxAsCSS,
      ...fontStyles,
      ...jsStyle,
    });

    // CRITICAL: Register validation errors - FormComponent will display them
    useComponentValidation(
      model.id,
      model.componentName,
      'datatable.pager',
      () => {
        if (!store) {
          return {
            hasErrors: true,
            validationType: 'error',
            errors: [{
              propertyName: 'Missing Required Parent Component',
              error: 'CONFIGURATION ERROR: Table Pager MUST be placed inside a Data Context, Data Table, or Data List component. This component cannot function without a data source.',
            }],
          };
        }
        return undefined;
      },
      [store],
    );

    if (model.hidden) return null;

    return <TablePager {...model} style={additionalStyles} />;
  },
  initModel: (model: IPagerComponentProps) => {
    return {
      ...model,
      showSizeChanger: true,
      showTotalItems: true,
      items: [],
    };
  },
  migrator: (m) =>
    m
      .add<IPagerComponentProps>(0, (prev) => ({ ...prev }) as IPagerComponentProps)
      .add<IPagerComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IPagerComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<IPagerComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) }))
      .add<IPagerComponentProps>(4, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) })),

  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default PagerComponent;
