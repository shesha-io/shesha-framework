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
