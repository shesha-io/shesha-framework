import React from 'react';
import { Story, Meta } from '@storybook/react';
import ConfigurableThemePage, { IConfigurableThemePageProps } from '.';
import StoryApp from '../../../components/storyBookApp';
import { SidebarMenuDefaultsProvider } from '../../../providers';
import { DefaultLayout } from '../../../components';

export default {
  title: 'Pages/ConfigurableThemePage',
  component: ConfigurableThemePage,
  argTypes: {}
} as Meta;

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
      <DefaultLayout __hideHeader>
        <ConfigurableThemePage {...args} />
      </DefaultLayout>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

// Reuse that template for creating different stories
export const WithPage = TemplateWithPage.bind({});

Basic.args = {};
