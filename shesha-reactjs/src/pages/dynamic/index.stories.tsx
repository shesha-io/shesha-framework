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

export const OrderDetails = addStory(Template, {
  formId: { name: 'order-details', module: 'boxfusion.inventory' },
  id: 'da4d3320-7c71-4df4-9d20-0ce51d9c1a66',
});

export const TableInlineEditing = addStory(Template, {
  formId: { name: 'table-inline', module: 'test' },
});

export const FormsIndex = addStory(Template, {
  formId: { name: 'forms', module: 'shesha' },
});

export const OrganisationEdit = addStory(Template, {
  formId: {
    name: 'organisation-edit',
    module: 'Test Module',
    version: 1,
  },
  id: '5BC9A277-63ED-4A71-919F-0B4064363BBC'
});

export const PersonEdit = addStory(Template, {
  formId: {
    name: 'person-edit',
    module: 'Test Module',
    version: 7,
  },
  id: '32E2B3DD-4D99-4542-AF71-134EC7C0E2CE'
});

export const PersonDetails = addStory(Template, {
  formId: {
    name: 'person-details',
    module: 'Test Module',
    version: 1,
  },
});

export const TestMap = addStory(Template, {
  // formId: '21ca7d2c-6b26-4434-8df0-55523ab1827d',
  formId: {
    name: 'playground',
    module: 'TestModule',
  },
  // mode: 'readonly',
  id: 'dc7f6c47-d537-418f-8eda-d0b7f796ea67',
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

export const BugFix = addStory(Template, {
  formId: {
    name: 'auto-complete-component-table',
    module: 'Shesha'
  },
  mode: 'edit'
});

export const Hydration = addStory(Template, {
  formId: {
    name: 'flattened-facility-appointment-table',
    module: 'Boxfusion.His.Bookings'
  },
  mode: 'edit'
});

export const TableLayout = addStory(Template, {
  formId: {
    name: 'table-layout',
    module: 'TestModule'
  },
  mode: 'edit'
});

export const InMemoryTable = addStory(Template, {
  formId: {
    name: 'in-memory-table',
    module: 'TestModule'
  },
  mode: 'edit'
});