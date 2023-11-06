import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { SwapOutlined } from '@ant-design/icons';
import ShaDrawer from './drawer';
import { IDrawerProps } from './models';
import { getSettings } from './settings';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { migrateCustomFunctions, migratePropertyName } from '../../../../designer-components/_common-migrations/migrateSettings';

const DrawerComponent: IToolboxComponent<IDrawerProps> = {
  type: 'drawer',
  name: 'Drawer',
  icon: <SwapOutlined />,
  Factory: ({ model }) => {
    const { size, style, ...props } = model;

    return <ShaDrawer {...props} />;
  },
  settingsFormMarkup: data => getSettings(data),
  migrator: (m) => m
    .add<IDrawerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,  
  initModel: model => {
    const customProps: IDrawerProps = {
      ...model,
    };
    return customProps;
  },
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

export default DrawerComponent;
