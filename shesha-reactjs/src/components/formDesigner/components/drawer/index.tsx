import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { SwapOutlined } from '@ant-design/icons';
import ShaDrawer from './drawer';
import { IDrawerProps } from './models';
import { getSettings } from './settings';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';

const DrawerComponent: IToolboxComponent<IDrawerProps> = {
  type: 'drawer',
  name: 'Drawer',
  icon: <SwapOutlined />,
  factory: (model: IDrawerProps) => {
    const { size, style, ...props } = model;

    return <ShaDrawer {...props} />;
  },
  settingsFormMarkup: data => getSettings(data),
  initModel: model => {
    const customProps: IDrawerProps = {
      ...model,
    };
    return customProps;
  },
  validateSettings: model => validateConfigurableComponentSettings(getSettings(model), model),
};

export default DrawerComponent;
