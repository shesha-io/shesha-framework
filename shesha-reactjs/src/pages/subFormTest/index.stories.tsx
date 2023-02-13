import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import SubFormTestPage from './';
import StoryApp from '../../components/storyBookApp';

export default {
  title: 'Pages/SubFormTest',
  component: SubFormTestPage,
} as ComponentMeta<typeof SubFormTestPage>;

const EntityConfiguratorTemplate: ComponentStory<typeof SubFormTestPage> = (args) => (
  <StoryApp>
    <SubFormTestPage {...args} />
  </StoryApp>
);

export const Primary = EntityConfiguratorTemplate.bind({});
Primary.args = { id: null };//'3F0C6DF1-9135-4DC6-9905-E5D1EABB87A8' };
