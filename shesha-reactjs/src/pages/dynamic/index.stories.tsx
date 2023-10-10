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

export const FncAddMember = addStory(Template, {
  formId: { name: 'Add-Member', module: 'Shesha' },
  mode: 'edit',
  id: '5BC9A277-63ED-4A71-919F-0B4064363BBC'
});

export const FncTableForteenTest = addStory(Template, {
  formId: { name: 'Table-forteen-Test', module: 'Shesha' },
});

export const FncPaymentDetailsView = addStory(Template, {
  formId: { name: 'payment-details-view', module: 'Shesha' },
  id: '4b47ff58-3511-486e-81a2-2299ff7c515e',
  mode: 'edit',
});

export const DepCustomerDetails = addStory(Template, {
  formId: { name: 'customer-details', module: 'Boxfusion.Dep' },
  id: '7cd698ce-9e41-4604-8ef6-08f0e1a8144d',
});

export const DepCaseDetailsDuplicate = addStory(Template, {
  formId: { name: 'case-details-duplicate', module: 'CaseManagement' },
  id: '21345e5a-7862-4f83-b5b3-0b404967915c',
});

export const DepStarterTemplate = addStory(Template, {
  formId: { name: 'service-requests-mapule', module: 'StarterTemplate' },
});

export const OrganisationEdit = addStory(Template, {
  formId: {
    name: 'organisation-edit',
    module: 'Test Module',
    version: 1,
  },
  id: '5BAB9D40-4177-42C4-8049-0120A2B7F3C9'
});

export const PersonEdit = addStory(Template, {
  formId: {
    name: 'person-edit',
    module: 'Test Module',
    version: 7,
  },
});

export const PersonDetails = addStory(Template, {
  formId: {
    name: 'person-details',
    module: 'Test Module',
    version: 1,
  },
});

export const FormDetails = addStory(Template, {
  formId: {
    name: 'form-details',
    module: 'shesha',
    version: 1,
  },
});

export const PermissionEdit = addStory(Template, {
  formId: {
    name: 'permission-edit',
    module: 'Test Module',
    version: 2,
  },
});

export const Fetchers = addStory(Template, {
  formId: {
    name: 'fetchers',
    module: 'TestModule'
  },
  mode: 'edit'
});

export const WorkflowDefinitions = addStory(Template, {
  formId: {
    name: 'workflow-definitions',
    module: 'Shesha.Enterprise.Workflow'
  }
});

export const BugFix = addStory(Template, {
  formId: {
    name: 'role-details',
    module: 'Shesha'
  },
  mode: 'edit',
  id: 'b83ceadd-cd9d-41db-9951-1fda1ab61f1e'
});