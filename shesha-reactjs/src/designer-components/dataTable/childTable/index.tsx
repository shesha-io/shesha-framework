import { TableOutlined } from '@ant-design/icons';
import React from 'react';
import { IConfigurableFormComponent, IToolboxComponent } from '@/interfaces';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { migrateV2toV3 } from './migrations/migrate-v3';
import { IChildTableSettingsProps } from './models';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateVisibility } from '@/designer-components/_common-migrations/migrateVisibility';
import { IPanelComponentProps, migrateToTable } from './migrations/migrateToTable';

export interface IChildTableComponentProps extends IChildTableSettingsProps, IConfigurableFormComponent {
  components?: IConfigurableFormComponent[];
}

const ChildTableComponent: IToolboxComponent<IPanelComponentProps> = {
  type: 'childTable',
  isInput: false,
  name: 'Child Table',
  icon: <TableOutlined />,
  isHidden: true,
  Factory: () => {
    throw new Error('Child Table component was removed');
  },

  settingsFormFactory: () => {
    throw new Error('Child Table component was removed');
  },
  migrator: (m) =>
    m
      .add<IChildTableComponentProps>(0, (prev) => {
        return {
          ...prev,
          isNotWrapped: prev['isNotWrapped'] ?? true,
          defaultSelectedFilterId: null,
        };
      })
      .add<IChildTableComponentProps>(1, migrateV0toV1)
      .add<IChildTableComponentProps>(2, migrateV1toV2)
      .add<IChildTableComponentProps>(3, migrateV2toV3)
      .add(4, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
      .add<IChildTableComponentProps>(5, (prev) => migrateVisibility(prev))
      .add<IPanelComponentProps>(6, (prev, context) => migrateToTable(prev, context)),
};

export default ChildTableComponent;
