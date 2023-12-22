import ConfigurableSidebarMenu from './';
import React from 'react';
import SidebarConfigurator from './configurator';
import StoryApp from '@/components/storyBookApp';
import { AppEditModeToggler } from '@/components';
import { SIDEBAR_MENU_NAME } from '@/shesha-constants';
import { SidebarMenuConfiguratorProvider } from '@/providers/sidebarMenuConfigurator';
import { Story } from '@storybook/react';

export default {
  title: 'Components/ConfigurableSidebarMenu',
  component: ConfigurableSidebarMenu
};

export interface IConfigurableSidebarMenuProps {
  backendUrl: string;
}

// Create a master template for mapping args to render the component
const Template: Story<IConfigurableSidebarMenuProps> = () => (
  <StoryApp>
    <AppEditModeToggler />
    <ConfigurableSidebarMenu
      name={SIDEBAR_MENU_NAME}
      isApplicationSpecific={true}
      defaultSettings={{
        items: [
          {
            id: 'item1',
            title: 'Item 1',
            itemType: 'button',
          },
          {
            id: 'item2',
            title: 'Item 2',
            itemType: 'button',
          },
        ],
      }}
    />
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = {};

export interface IConfiguratorTemplateProps {}

// Create a master template for mapping args to render the component
const ConfiguratorTemplate: Story<IConfiguratorTemplateProps> = _props => (
  <StoryApp>
    <SidebarMenuConfiguratorProvider items={[]}>
      <SidebarConfigurator />
    </SidebarMenuConfiguratorProvider>
  </StoryApp>
);

export const Configurator = ConfiguratorTemplate.bind({});
Configurator.args = {};
