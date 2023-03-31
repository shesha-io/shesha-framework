import React from 'react';
import { Story, Meta } from '@storybook/react';
import StoryApp from '../../components/storyBookApp';
import DesignerPage, { IDesignerPageProps } from './';
import { addStory } from '../../stories/utils';
import { MainLayout } from '../..';

export default {
  title: 'Pages/Designer',
  component: DesignerPage,
  argTypes: {}
} as Meta;

// Create a master template for mapping args to render the Button component
const Template: Story<IDesignerPageProps> = args => (
  <StoryApp>
    <MainLayout>
      <DesignerPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const Test = addStory(Template, {
  formId: 'b9b13fd7-21cf-4e65-9422-fb471c3ea216',
});

