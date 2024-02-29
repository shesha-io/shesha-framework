import { FormsDesignerPage, IFormsDesignerPagePageProps } from './';
import React from 'react';
import StoryApp from '@/components/storyBookApp';
import { addStory } from '@/stories/utils';
import { MainLayout } from '@/components';
import { Story } from '@storybook/react';

export default {
  title: 'Pages/Designer',
  component: FormsDesignerPage,
  argTypes: {},
};

// Create a master template for mapping args to render the Button component
const Template: Story<IFormsDesignerPagePageProps> = (args) => (
  <StoryApp>
    <MainLayout>
      <FormsDesignerPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const DefaultDesignerPage = addStory(Template, {
  formId: '732c7ffa-9a47-4199-b0c9-1e73432f91c7',
});

export const TableDesignerPage = addStory(Template, {
  formId: '4f9f0a81-1ece-4992-937d-071fa43d5a78',
});
