import React from 'react';
import { Story, Meta } from '@storybook/react';
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
const Template: Story<IDesignerPageProps> = (args) => (
  <StoryApp>
    <MainLayout>
      <DesignerPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const FncDesignerPlayground = addStory(Template, {
  formId: '6392bcf3-2625-48e3-b521-4d46a3b54954',
});

export const FncDesignerTSchoolDetails = addStory(Template, {
  formId: '9da17eae-3099-4835-b196-200bfb955ae7',
});

export const FncDesignerTestDetails = addStory(Template, {
  formId: 'e41926d1-0fe1-476d-804a-0b692cb8153d',
});

export const FncDesignerTextComponentDetails = addStory(Template, {
  formId: 'd5e910a8-3f5b-4a96-9e7d-5142e14965f1',
});

export const FncDesignerBooksTable = addStory(Template, {
  formId: '2be1e350-078f-4d5c-aa76-5906a69af0bc',
});

export const FncDesignerAddMember = addStory(Template, {
  formId: '42a4135c-bd2d-4dba-bc2c-6bbd8bace7da',
});

export const FncDesignerMemberDetailsView = addStory(Template, {
  formId: 'c3b1d5f5-dcc6-4957-b45f-34bdc9f59d95',
});

export const FncDesignerMemberCreateView = addStory(Template, {
  formId: 'd69e9365-1121-4a45-bab2-e93f5d67f8b6',
});

export const FncDesignerDeployCreate = addStory(Template, {
  formId: '3c2dd65f-5b03-4db5-9a3a-64dc850c7e14',
});
