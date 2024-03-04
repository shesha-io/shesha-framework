import { DynamicPage } from './';
import React from 'react';
import StoryApp from '@/components/storyBookApp';
import { addStory } from '@/stories/utils';
import { IDynamicPageProps } from './interfaces';
import { MainLayout } from '@/components';
import { Story } from '@storybook/react';

export default {
  title: 'Pages/DynamicPage',
  component: DynamicPage,
  argTypes: {},
};

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

export const DefaultDynmicPage = addStory(Template, {
  formId: { name: 'playground', module: 'Shesha' },
});

export const BackgroundDataTable = addStory(Template, {
  formId: { name: 'member-table-view', module: 'Shesha' },
});

export const RefListStatusTag = addStory(Template, {
  formId: { name: 'status-component-reflist-detailsv1', module: 'Boxfusion.SheshaFunctionalTests.Common' },
  id: '9cc09c5e-b83a-45f3-8352-1467567b5da3',
});



