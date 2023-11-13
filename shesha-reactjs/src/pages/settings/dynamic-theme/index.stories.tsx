import React from 'react';
import { Story } from '@storybook/react';
import ConfigurableThemePage, { IConfigurableThemePageProps } from '.';
import StoryApp from 'components/storyBookApp';
import { SidebarMenuDefaultsProvider } from 'providers';
import { MainLayout } from 'components';

export default {
  title: 'Pages/ConfigurableThemePage',
  component: ConfigurableThemePage,
  argTypes: {}
};

// Create a master template for mapping args to render the Button component
const Template: Story<IConfigurableThemePageProps> = args => (
  <StoryApp>
    <ConfigurableThemePage {...args} />
  </StoryApp>
);

// Create a master template for mapping args to render the Button component
const TemplateWithPage: Story<IConfigurableThemePageProps> = args => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <MainLayout>
        <ConfigurableThemePage {...args} />
      </MainLayout>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

// Reuse that template for creating different stories
export const WithPage = TemplateWithPage.bind({});

Basic.args = {};
