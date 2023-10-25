import React from 'react';
import { Story } from '@storybook/react';
import FormDesigner from './formDesigner';
import { addStory } from '../../stories/utils';
import { FormIdentifier, FormMode } from '../../providers/form/models';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/Temp/FormDesigner',
  component: FormDesigner,
};

export interface IFormDesignerStoryProps {
  formId: FormIdentifier;
  mode?: FormMode;
}

// Create a master template for mapping args to render the Button component
const DesignerTemplate: Story<IFormDesignerStoryProps> = ({ formId }) => (
  <StoryApp>
    <FormDesigner formId={formId} />
  </StoryApp>
);

export const TestMap = addStory(DesignerTemplate, {
  formId: 'a91902be-ca79-4230-a7a5-9084db9b2295',
  // formId: {
  //   name: 'test-wizard-form',
  //   module: 'Shesha',
  // },
  // mode: 'readonly',
});

export const OrderDetails = addStory(DesignerTemplate, {
  formId: 'a9624689-59f5-45fd-9185-c82037b8fe25',
});

export const ColumnSettings = addStory(DesignerTemplate, {
  formId: 'e56015be-ea87-4d6a-8f67-d69462d4a94e',
});

export const BedFilter = addStory(DesignerTemplate, {
  formId: '7065cf3a-a8ec-494e-b2c8-273274b86d1f',
});

export const CustomFunctions = addStory(DesignerTemplate, {
  formId: '30c5cd95-e96d-4023-b213-94b1531ec6d9',
});

export const FormsIndex = addStory(DesignerTemplate, {
  formId: {
    name: 'forms',
    module: 'shesha',
  },
});

export const OrganisationEdit = addStory(DesignerTemplate, {
  formId: {
    name: 'organisation-edit',
    module: 'Test Module',
    version: 1,
  },
});

export const PersonEdit = addStory(DesignerTemplate, {
  formId: {
    name: 'person-edit',
    module: 'Test Module',
    version: 7
  }
});

export const PersonDetails = addStory(DesignerTemplate, {
  formId: {
    name: 'person-details',
    module: 'Test Module',
    version: 1
  }
});

export const FormDetails = addStory(DesignerTemplate, {
  formId: {
    name: 'form-details',
    module: 'shesha',
    version: 1
  }
});

export const PermissionEdit = addStory(DesignerTemplate, {
  formId: 'AFF750FD-1AC6-45C9-B478-B98DB7DE8CD0'
  /*{
    name: 'permission-edit',
    module: 'Test Module'
  }*/
});

export const DatatableInlineEdit = addStory(DesignerTemplate, {
  formId: 'd9e57701-5328-4395-8d71-580fd21d2d0e'
});

export const TableLayout = addStory(DesignerTemplate, {
  formId: '27961719-f092-4c9c-9617-1af59f1e3c11'
});

export const IdBug = addStory(DesignerTemplate, {
  formId: '26a5e494-a632-468e-aec8-401a192c56f0'
});

export const TableProps = addStory(DesignerTemplate, {
  formId: 'e9f6a715-cbe2-42c0-844f-fe97b5b8f476'
});

export const UserManagement = addStory(DesignerTemplate, {
  formId: '2c318a27-fab1-417d-b203-c263aaaeeebb'
});

//TestModule/ivan-test-form
export const IvanTestForm = addStory(DesignerTemplate, {
  //formId: 'fc8e3f36-793b-4a30-ab6f-f4dd56bfa3c0'
  //formId: '08027d6e-bc07-424e-8a7a-a43f49d8e64d'
  formId: 'f1344d6b-67a5-422a-98a0-4ef6b8c1ef48'  
});

export const TableGrouping = addStory(DesignerTemplate, {
  formId: 'c4f61a79-f03f-4a63-bf02-bf72f7d66f0e'
});

export const DataList = addStory(DesignerTemplate, {
  formId: 'b0109b98-0660-427f-b373-4ca78f9a50ff'
});

export const HomeUrls = addStory(DesignerTemplate, {
  formId: '52b8ffd5-9d50-40a1-9856-f6d2ab30eb1b'
});

export const InMemoryTable = addStory(DesignerTemplate, {
  formId: '4866ae36-17ef-4df0-bff9-5d29e23dd03c'
  // formId: 'c2773e2b-6cd8-4892-ad30-7b92e5132229'
});
