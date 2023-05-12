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
  argTypes: {}
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IDynamicPageProps> = args => (
  <StoryApp>
    <MainLayout>
      <DynamicPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const OrderDetails = addStory(Template, {
  formId: { name: 'order-details', module: 'boxfusion.inventory' },
  id: 'da4d3320-7c71-4df4-9d20-0ce51d9c1a66'
});

export const TableInlineEditing = addStory(Template, {
  formId: { name: 'table-inline', module: 'test' }
});

export const FormsIndex = addStory(Template, {
  formId: { name: 'forms', module: 'shesha' }
});

export const OrganisationEdit = addStory(Template, {
  formId: {
    name: 'organisation-edit',
    module: 'Test Module',
    version: 1
  }  
});

export const PersonEdit = addStory(Template, {
  formId: {
    name: 'person-edit',
    module: 'Test Module',
    version: 7
  }
});

export const PersonDetails = addStory(Template, {
  formId: {
    name: 'person-details',
    module: 'Test Module',
    version: 1
  }
});