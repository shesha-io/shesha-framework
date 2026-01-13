import React from 'react';
import { ITableViewSelectorComponentProps, TableViewSelectorComponentDefinition } from './models';
import { migrateFilterMustacheExpressions } from '@/designer-components/_common-migrations/migrateUseExpression';
import { migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { SelectOutlined } from '@ant-design/icons';
import { TableViewSelector } from './tableViewSelector';
import { ConfigurableFormItem, useDataTableStore, validateConfigurableComponentSettings } from '@/index';
import { getSettings } from './settingsForm';
import { useStyles } from '../tableContext/styles';
import { useComponentValidation } from '@/providers/validationErrors';

const TableViewSelectorComponent: TableViewSelectorComponentDefinition = {
  type: 'tableViewSelector',
  isInput: false,
  name: 'Table view selector',
  icon: <SelectOutlined />,
  Factory: ({ model }) => {
    const store = useDataTableStore(false);
    const { styles } = useStyles();

    // CRITICAL: Register validation errors - FormComponent will display them
    useComponentValidation(
      model.id,
      model.componentName,
      'tableViewSelector',
      () => {
        if (!store) {
          return {
            hasErrors: true,
            validationType: 'error',
            errors: [{
              propertyName: 'Missing Required Parent Component',
              error: 'CONFIGURATION ERROR: Table View Selector MUST be placed inside a Data Context, Data Table, or Data List component. This component cannot function without a data source.',
            }],
          };
        }
        return undefined;
      },
      [store],
    );

    const content = store
      ? <TableViewSelector {...model} />
      : (
        <div className={styles.hintContainer}>
          <div className={styles.viewSelectorMockup}>
            View: Default
          </div>
        </div>
      );

    return (
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {content}
      </ConfigurableFormItem>
    );
  },
  initModel: (model: ITableViewSelectorComponentProps) => {
    // Ensure component always has at least 1 filter for WYSIWYG display
    const defaultFilters = model.filters && model.filters.length > 0
      ? model.filters
      : [{
        id: 'default-all-records',
        name: 'Default',
        tooltip: 'Shows all records without any filtering',
        sortOrder: 0,
        expression: null, // No filter expression = show all
      }];

    return {
      ...model,
      filters: defaultFilters,
      persistSelectedFilters: model.persistSelectedFilters ?? true,
    };
  },
  migrator: (m) => m.add<ITableViewSelectorComponentProps>(0, (prev) => {
    return {
      ...prev,
      title: prev['title'] ?? 'Title',
      filters: prev['filters'] ?? [{
        id: 'default-all-records',
        name: 'Default',
        tooltip: 'Shows all records without any filtering',
        sortOrder: 0,
        expression: null,
      }],
    };
  })
    .add(1, (prev) => (
      { ...prev, filters: prev.filters.map((filter) => migrateFilterMustacheExpressions(filter)) }
    ))
    .add(2, (prev) => migratePropertyName(prev)),
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export default TableViewSelectorComponent;
