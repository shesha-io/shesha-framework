import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { AppstoreOutlined } from '@ant-design/icons';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import DynamicView from './dynamicView';
import { getSettings } from './settings';

export type DynamicViewComponentProps = IConfigurableFormComponent;

/** @deprecated */
const DynamicViewComponent: IToolboxComponent<DynamicViewComponentProps> = {
  type: 'dynamicView',
  isInput: false,
  name: 'Dynamic View',
  icon: <AppstoreOutlined />,
  Factory: ({ model }) => {
    return (
      <DynamicView {...model} />
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default DynamicViewComponent;
