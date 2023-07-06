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

export const EpmUserManagemenet = addStory(Template, {
  formId: { name: 'user-management-new', module: '' },
});

export const FncTSchoolDetails = addStory(Template, {
  formId: { name: 'School-Details', module: 'Boxfusion.SheshaFunctionalTests.Common' },
  id: 'ca55ba17-6af1-4a62-b0f2-fb3657faa9c1',
});

export const FncTextComponentDetails = addStory(Template, {
  formId: { name: 'text-component-details', module: 'Shesha' },
});
