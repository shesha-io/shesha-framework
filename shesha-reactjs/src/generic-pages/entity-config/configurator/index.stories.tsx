import React from 'react';
import { StoryFn } from '@storybook/react';
import { EntityConfiguratorPage } from './';
import StoryApp from '@/components/storyBookApp';

export default {
  title: 'Pages/EntityConfigurator',
  component: EntityConfiguratorPage,
};

const EntityConfiguratorTemplate: StoryFn<typeof EntityConfiguratorPage> = (args) => (
  <StoryApp>
    <EntityConfiguratorPage {...args} />
  </StoryApp>
);

export const Primary = EntityConfiguratorTemplate.bind({});

Primary.args = { id: null };
