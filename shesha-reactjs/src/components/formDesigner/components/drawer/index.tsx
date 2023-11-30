import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { SwapOutlined } from '@ant-design/icons';
import ShaDrawer from './drawer';
import { IDrawerProps } from './models';
import { getSettings } from './settings';
import { getLayoutStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import {
  migrateCustomFunctions,
  migratePropertyName,
} from '@/designer-components/_common-migrations/migrateSettings';
import { useFormData, useGlobalState } from '@/providers';

const DrawerComponent: IToolboxComponent<IDrawerProps> = {
  type: 'drawer',
  name: 'Drawer',
  icon: <SwapOutlined />,
  Factory: ({ model }) => {
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { size, style, ...props } = model;

    return <ShaDrawer style={getLayoutStyle(model, { data, globalState })} {...props} />;
  },
  settingsFormMarkup: (data) => getSettings(data),
  migrator: (m) => m.add<IDrawerProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev))),
  initModel: (model) => {
    const customProps: IDrawerProps = {
      ...model,
    };
    return customProps;
  },
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default DrawerComponent;
