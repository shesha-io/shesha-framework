import { ComponentsContainer } from '@/components';
import { FormItemProvider, IConfigurableFormComponent } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ParentProvider from '@/providers/parentProvider/index';
import { GroupOutlined } from '@ant-design/icons';
import React from 'react';
import { IPropertyRouterComponentProps, PropertyRouterComponentDefinition } from './interfaces';
import { getSettings } from './settingsForm';

const PropertyRouterComponent: PropertyRouterComponentDefinition = {
  type: 'propertyRouter',
  isInput: false,
  name: 'Property router',
  icon: <GroupOutlined />,
  Factory: ({ model }) => {
    return model.hidden
      ? null
      : (
        <ParentProvider model={model}>
          <FormItemProvider namePrefix={model.propertyRouteName}>
            <ComponentsContainer containerId={model.id} dynamicComponents={model?.isDynamic ? model?.components : []} />
          </FormItemProvider>
        </ParentProvider>
      );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
};

export const isPropertyRouterComponent = (component: IConfigurableFormComponent): component is IPropertyRouterComponentProps => component.type === PropertyRouterComponent.type;

export default PropertyRouterComponent;
