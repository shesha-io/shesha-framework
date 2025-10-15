import _ from 'lodash';
import React from 'react';

import { ITableViewSelectorComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateFilterMustacheExpressions } from '@/designer-components/_common-migrations/migrateUseExpression';
import { migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { SelectOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { TableViewSelector } from './tableViewSelector';
import { Popover } from 'antd';
import { ConfigurableFormItem, useDataTableStore, validateConfigurableComponentSettings } from '@/index';
import { useTheme } from '@/providers/theme';
import { getSettings } from './settingsForm';
import { useStyles } from '../tableContext/styles';

const TableViewSelectorComponent: IToolboxComponent<ITableViewSelectorComponentProps> = {
  type: 'tableViewSelector',
  isInput: false,
  name: 'Table view selector',
  icon: <SelectOutlined />,
  Factory: ({ model }) => {
    const store = useDataTableStore(false);
    const { theme } = useTheme();
    const { styles } = useStyles();

    return (
      <ConfigurableFormItem model={{ ...model, hideLabel: true }}>
        {store
          ? <TableViewSelector {...model} />
          : (
            <>
              <style>
                {styles.quickSearchPopoverArrowStyles}
              </style>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  backgroundColor: '#fafafa',
                  color: '#8c8c8c',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
                >
                  View: Default
                </div>
                <Popover
                  placement="right"
                  title="Hint:"
                  rootClassName={styles.tableViewSelectorHintPopover}
                  classNames={{
                    body: styles.tableViewSelectorHintPopover,
                  }}
                  content={(
                    <p>The Table View Selector component must be<br /> placed inside of a Data Context<br /> component to be fully functional.
                      <br />
                      <br />
                      <a href="https://docs.shesha.io/docs/category/tables-and-lists" target="_blank" rel="noopener noreferrer">See component documentation</a><br />for setup and usage.
                    </p>
                  )}
                >
                  <InfoCircleOutlined style={{ color: theme.application?.warningColor, cursor: 'help' }} />
                </Popover>
              </div>
            </>
          )}
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default TableViewSelectorComponent;
