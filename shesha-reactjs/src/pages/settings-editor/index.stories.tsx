import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import StoryApp from '../../components/storyBookApp';
import SettingsEditorPage, { ISettingsEditorPageProps } from './';
import { addStory } from '../../stories/utils';
import { MainLayout } from '../..';

export default {
  title: 'Pages/SettingsEditor',
  component: SettingsEditorPage,
  argTypes: {},
} as Meta;

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

