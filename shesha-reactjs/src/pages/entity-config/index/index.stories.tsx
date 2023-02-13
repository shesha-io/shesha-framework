import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import EntityConfigurationsIndexPage from './';
import StoryApp from '../../../components/storyBookApp';
import { getDefaultLayout } from '../../../components';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Pages/EntitiesIndex',
  component: EntityConfigurationsIndexPage,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof EntityConfigurationsIndexPage>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EntityConfigurationsIndexPage> = (args) => (
  <StoryApp>
    <EntityConfigurationsIndexPage {...args} />
  </StoryApp>
);

EntityConfigurationsIndexPage.getLayout = getDefaultLayout;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};
