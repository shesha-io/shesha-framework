import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { GenericEditPage, IGenericEditPageProps } from '../..';
import { usePersonGet, usePersonUpdate } from '../../apis/person';
import { addStory } from '../../stories/utils';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/CrudViews/EditView',
  component: GenericEditPage,
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IGenericEditPageProps> = props => {
  const onDataLoaded = model => {
    console.log(model);
  };
  return (
    <StoryApp>
      <GenericEditPage
        title={() => 'User Edit'}
        id={props.id}
        fetcher={props.fetcher}
        updater={props.updater}
        formPath={props.formPath}
        onDataLoaded={onDataLoaded}
      />
    </StoryApp>
  );
};

export const Base = addStory(Template, {
  id: 'AA0F6A79-B57B-4F4E-A6C3-3825AB3545F2',
  formPath: '/persons/edit',
  fetcher: usePersonGet,
  updater: usePersonUpdate,
});
