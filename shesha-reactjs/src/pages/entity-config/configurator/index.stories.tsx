import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import EntityConfiguratorPage from './';
import StoryApp from '../../../components/storyBookApp';

// // More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Pages/EntityConfigurator',
  component: EntityConfiguratorPage,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof EntityConfiguratorPage>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const EntityConfiguratorTemplate: ComponentStory<typeof EntityConfiguratorPage> = (args) => (
  <StoryApp>
    <EntityConfiguratorPage {...args} />
  </StoryApp>
);

export const Primary = EntityConfiguratorTemplate.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = { id: null };//'3F0C6DF1-9135-4DC6-9905-E5D1EABB87A8' };
