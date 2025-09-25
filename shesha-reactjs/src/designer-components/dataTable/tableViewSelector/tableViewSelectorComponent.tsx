import _ from 'lodash';
import React from 'react';

import { ITableViewSelectorComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { migrateFilterMustacheExpressions } from '@/designer-components/_common-migrations/migrateUseExpression';
import { migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { SelectOutlined } from '@ant-design/icons';
import { TableViewSelector } from './tableViewSelector';
import { Alert } from 'antd';
import { useDataTableStore, validateConfigurableComponentSettings } from '@/index';
import { getSettings } from './settingsForm';

const TableViewSelectorComponent: IToolboxComponent<ITableViewSelectorComponentProps> = {
  type: 'tableViewSelector',
  isInput: false,
  name: 'Table view selector',
  icon: <SelectOutlined />,
  Factory: ({ model }) => {
    const store = useDataTableStore(false);
    return store
      ? <TableViewSelector {...model} />
      : <Alert
          className="sha-designer-warning"
          message="Table view selector must be used within a Data Table Context"
          type="warning"
      />;
  },
  migrator: (m) => m.add<ITableViewSelectorComponentProps>(0, (prev) => {
    return {
      ...prev,
      title: prev['title'] ?? 'Title',
      filters: prev['filters'] ?? [],
    };
  })
    .add(1, (prev) => (
      { ...prev, filters: prev.filters.map((filter) => migrateFilterMustacheExpressions(filter)) }
    ))
    .add(2, (prev) => migratePropertyName(prev))
  ,
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default TableViewSelectorComponent;
