import React from 'react';
import { Story, Meta } from '@storybook/react';
import FormDesigner from './formDesigner';
import { MetadataDispatcherProvider } from '../../providers';
import { addStory } from '../../stories/utils';
import { FormIdentifier, FormMode } from '../../providers/form/models';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/Temp/FormDesigner',
  component: FormDesigner
} as Meta;

export interface IFormDesignerStoryProps {
  formId: FormIdentifier;
  mode?: FormMode;
}

// Create a master template for mapping args to render the Button component
const DesignerTemplate: Story<IFormDesignerStoryProps> = ({ formId }) => (
  <StoryApp>
    <MetadataDispatcherProvider>
      <FormDesigner formId={formId} />
    </MetadataDispatcherProvider>
  </StoryApp>
);

export const Bugfix = addStory(DesignerTemplate, {
  formId: '7065cf3a-a8ec-494e-b2c8-273274b86d1f'
});

export const ColumnSettings = addStory(DesignerTemplate, {
  formId: 'e56015be-ea87-4d6a-8f67-d69462d4a94e'
});

export const BedFilter = addStory(DesignerTemplate, {
  formId: '7065cf3a-a8ec-494e-b2c8-273274b86d1f',
});

export const CustomFunctions = addStory(DesignerTemplate, {
  formId: '30c5cd95-e96d-4023-b213-94b1531ec6d9',
});

export const FormDetails = addStory(DesignerTemplate, {
  formId: 'ac80013a-c02b-433b-b813-877422747a74',
});

export const FormsIndex = addStory(DesignerTemplate, {
  formId: {
    name: 'forms',
    module: 'shesha',
  }
});

export const OrganisationEdit = addStory(DesignerTemplate, {
  formId: {
    name: 'organisation-edit',
    module: 'Test Module',
    version: 1
  }
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

export const PermissionEdit = addStory(DesignerTemplate, {
  formId: 'AFF750FD-1AC6-45C9-B478-B98DB7DE8CD0'
  /*{
    name: 'permission-edit',
    module: 'Test Module'
  }*/
});