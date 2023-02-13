import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { MetadataDispatcherProvider } from '../../providers';
import { ModelConfigurator, IModelConfiguratorProps } from './';
import { addStory } from '../../stories/utils';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/ModelConfigurator',
  component: ModelConfigurator,
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IModelConfiguratorProps> = args => (
  <StoryApp>
    <MetadataDispatcherProvider>
      <ModelConfigurator {...args} />
    </MetadataDispatcherProvider>
  </StoryApp>
);

export const NewModel = addStory(Template, {});

export const PersonModel = addStory(Template, {
  id: '0789BFDA-2864-451B-BC38-9F58F70BA11A',
});

export const EntityPropertyModel = addStory(Template, {
  id: '45AE2FE8-255B-462E-BDD8-FDA5C591AE08',
});

export const Holiday = addStory(Template, {
  id: '3F0C6DF1-9135-4DC6-9905-E5D1EABB87A8',
});
