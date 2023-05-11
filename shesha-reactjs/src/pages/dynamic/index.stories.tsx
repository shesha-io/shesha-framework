import React from 'react';
import { Story, Meta } from '@storybook/react';
import StoryApp from '../../components/storyBookApp';
import DynamicPage from './';
import { addStory } from '../../stories/utils';
import { IDynamicPageProps } from './interfaces';
import { MainLayout } from '../..';

export default {
  title: 'Pages/DynamicPage',
  component: DynamicPage,
  argTypes: {},
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IDynamicPageProps> = (args) => (
  <StoryApp>
    <MainLayout>
      <DynamicPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const TableInlineEditing = addStory(Template, {
  formId: { name: 'table-inline', module: 'test' },
});

export const FormsIndex = addStory(Template, {
  formId: { name: 'forms', module: 'shesha' },
});

export const OrganisationEdit = addStory(Template, {
  formId: {
    name: 'organisation-edit',
    module: 'Test Module',
    version: 1,
  },
});

export const PersonEdit = addStory(Template, {
  formId: {
    name: 'person-edit',
    module: 'Test Module',
    version: 7,
  },
});

export const PersonDetails = addStory(Template, {
  formId: {
    name: 'person-details',
    module: 'Test Module',
    version: 1,
  },
});

export const TestMap = addStory(Template, {
  // formId: '21ca7d2c-6b26-4434-8df0-55523ab1827d',
  formId: {
    name: 'playground',
    module: 'TestModule',
  },
  // mode: 'readonly',
  id: 'dc7f6c47-d537-418f-8eda-d0b7f796ea67',
});
