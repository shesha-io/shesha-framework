import React from 'react';
import { DashOutlined } from '@ant-design/icons';
import { IToolboxComponent } from '@/interfaces';
import { IToolbarPropsV0, migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { IToolbarProps } from './migrations/models';
import { migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { migrateToButtonGroup, ToolbarButtonGroupProps } from './migrations/migrate-to-buttonGroup';

/**
 * NOTE: toolbar component is obsolete and was replaced with the `buttonGroup` component
 */
const ToolbarComponent: IToolboxComponent<ToolbarButtonGroupProps> = {
  type: 'toolbar',
  isInput: false,
  name: 'Toolbar',
  icon: <DashOutlined />,
  isHidden: true,
  Factory: () => {
    throw new Error('Toolbar component was removed');
  },
  migrator: (m) =>
    m
      .add<IToolbarPropsV0>(0, (prev) => {
        const items = prev['items'] && Array.isArray(prev['items']) ? prev['items'] : [];
        return { ...prev, items: items };
      })
      .add<IToolbarProps>(1, migrateV0toV1)
      .add<IToolbarProps>(2, migrateV1toV2)
      .add<IToolbarProps>(3, (prev) => migratePropertyName(prev))
      .add<ToolbarButtonGroupProps>(4, (prev) => migrateToButtonGroup(prev)),
  settingsFormFactory: () => {
    throw new Error('Toolbar component was removed');
  },
};

export default ToolbarComponent;
