import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import StoryApp from '../../components/storyBookApp';
import DesignerPage, { IDesignerPageProps } from './';
import { addStory } from '../../stories/utils';
import { MainLayout } from '../..';

export default {
  title: 'Pages/Designer',
  component: DesignerPage,
  argTypes: {},
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
  formId: '44cac8c6-5a91-4a6a-b1c0-cfed3766148d',
});

