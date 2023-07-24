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

export const EpmDesignerUserManagement = addStory(Template, {
  formId: 'd1d69771-07ec-46e0-9710-0c840295ecd2',
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

export const DepDesignerCaseDetails = addStory(Template, {
  formId: 'c6eb30fa-030e-4504-8247-64255377176b',
});

export const EntprDesignerTimeField = addStory(Template, {
  formId: 'adbfb402-07d1-4ff3-8cac-44acbe10ed50',
});
