import React from 'react';
import { Story, Meta } from '@storybook/react';
import { GenericDetailsPage, IGenericDetailsPageProps } from '../..';
import { usePersonGet } from '../../apis/person';
import { addStory } from '../../stories/utils';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/CrudViews/DetailsView',
  component: GenericDetailsPage
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IGenericDetailsPageProps> = props => {
  return (
    <StoryApp>
      <GenericDetailsPage
        title={() => 'User Details'}
        id={props.id}
        fetcher={props.fetcher}
        formId={props.formId}
      />
    </StoryApp>
  );
};

export const Base = addStory(Template, {
  id: 'AA0F6A79-B57B-4F4E-A6C3-3825AB3545F2',
  formId: { name: 'person-details' },
  fetcher: usePersonGet,
});
