import React from 'react';
import { DataSource } from './dataSource';
import { DataSourceSettingsForm } from './dataSourceSettings';
import { IDataSourceComponentProps } from './models';
import { IToolboxComponent } from '@/interfaces';
import { LayoutOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

const DataSourceComponent: IToolboxComponent<IDataSourceComponentProps> = {
  type: 'dataSource',
  isInput: false,
  name: 'DataSource',
  icon: <LayoutOutlined />,
  Factory: ({ model }) => {
    return <DataSource {...model} />;
  },
  migrator: (m) =>
    m.add<IDataSourceComponentProps>(0, (prev) => {
      return {
        ...prev,
        name: prev['uniqueStateId'] ?? prev['name'],
        sourceType: 'Entity',
      };
    })
      .add<IDataSourceComponentProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IDataSourceComponentProps>(2, (prev) => migrateVisibility(prev))
      .add<IDataSourceComponentProps>(3, (prev) => ({ ...migrateFormApi.properties(prev) })),
  settingsFormFactory: (props) => (<DataSourceSettingsForm {...props} />),
};

export default DataSourceComponent;
