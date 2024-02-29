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
  formId: 'f08cca40-8ca8-4bae-8b4b-3603a14bb86f',
});
