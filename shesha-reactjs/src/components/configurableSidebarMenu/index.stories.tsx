import React from 'react';
import { Story, Meta } from '@storybook/react';
import ConfigurableSidebarMenu from './';
import { AppEditModeToggler } from '@/components/..';
import SidebarConfigurator from './configurator';
import { SidebarMenuConfiguratorProvider } from '@/providers/sidebarMenuConfigurator';
import { SIDEBAR_MENU_NAME } from '../../shesha-constants';
import StoryApp from '@/components/storyBookApp';

export default {
  title: 'Components/ConfigurableSidebarMenu',
  component: ConfigurableSidebarMenu} as Meta;

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
            childItems: undefined,
          },
          {
            id: 'item2',
            title: 'Item 2',
            itemType: 'button',
            childItems: undefined,
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
