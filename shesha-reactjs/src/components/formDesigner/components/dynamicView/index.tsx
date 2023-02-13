import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { FormMarkup, IConfigurableFormComponent } from '../../../../providers/form/models';
import { AppstoreOutlined } from '@ant-design/icons';
import settingsFormJson from './settingsForm.json';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import DynamicView from './dynamicView';

export interface DynamicViewComponentProps extends IConfigurableFormComponent {
}

const settingsForm = settingsFormJson as FormMarkup;

const DynamicViewComponent: IToolboxComponent<DynamicViewComponentProps> = {
    type: 'dynamicView',
    name: 'Dynamic View',
    icon: <AppstoreOutlined />,
    factory: (model: DynamicViewComponentProps) => {
      return (
        <DynamicView {...model} />
      );
    },
    settingsFormMarkup: settingsForm,
    validateSettings: model => validateConfigurableComponentSettings(settingsForm, model),
  };

  export default DynamicViewComponent;