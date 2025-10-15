import { GroupOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '@/interfaces';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import { getSettings } from './settingsForm';
import { FormItemProvider, IConfigurableFormComponent } from '@/providers';
import { ComponentsContainer } from '@/components';
import ParentProvider from '@/providers/parentProvider/index';

export interface IPropertyRouterComponent extends IConfigurableFormComponent {
  propertyRouteName?: string;
  components?: IConfigurableFormComponent[];
}

const PropertyRouterComponent: IToolboxComponent<IPropertyRouterComponent> = {
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
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export const isPropertyRouterComponent = (component: IConfigurableFormComponent): component is IPropertyRouterComponent => component.type === PropertyRouterComponent.type;

export default PropertyRouterComponent;
