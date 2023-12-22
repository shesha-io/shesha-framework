import React from 'react';
import { SettingsPage, ISettingsPageProps } from './';
import StoryApp from '@/components/storyBookApp';
import { addStory } from '@/stories/utils';
import { MainLayout } from '@/components';
import { Story } from '@storybook/react';

export default {
  title: 'Pages/SettingsEditor',
  component: SettingsPage,
  argTypes: {}
};

// Create a master template for mapping args to render the Button component
const Template: Story<ISettingsPageProps> = args => (
  <StoryApp>
    <MainLayout>
      <SettingsPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const Test = addStory(Template, {
  id: null
});