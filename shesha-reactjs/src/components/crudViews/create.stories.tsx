import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { GenericCreatePage, IGenericCreatePageProps } from '../..';
import { usePersonTestCreate } from '../../apis/personTest';
import { addStory } from '../../stories/utils';
import { StoryApp } from '../storyBookApp';

export default {
  title: 'Components/CrudViews/CreateView',
  component: GenericCreatePage,
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IGenericCreatePageProps> = props => {
  return (
    <StoryApp>
      <GenericCreatePage title="Create User" updater={props.updater} formId={props.formId} />
    </StoryApp>
  );
};

export const Base = addStory(Template, {
  formId: { name: 'area-create' },
  updater: usePersonTestCreate,
});
