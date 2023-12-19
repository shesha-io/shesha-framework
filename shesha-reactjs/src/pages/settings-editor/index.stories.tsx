import React from 'react';
import { Story } from '@storybook/react';
import StoryApp from '@/components/storyBookApp';
import SettingsEditorPage, { ISettingsEditorPageProps } from './';
import { addStory } from '@/stories/utils';
import { MainLayout } from '@/pages/..';

export default {
  title: 'Pages/SettingsEditor',
  component: SettingsEditorPage,
  argTypes: {}
};

// Create a master template for mapping args to render the Button component
const Template: Story<ISettingsEditorPageProps> = args => (
  <StoryApp>
    <MainLayout>
      <SettingsEditorPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const Test = addStory(Template, {
  id: null
});

