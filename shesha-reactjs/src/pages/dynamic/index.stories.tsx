import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import StoryApp from '../../components/storyBookApp';
import DynamicPage from './';
import { addStory } from '../../stories/utils';
import { IDynamicPageProps } from './interfaces';
import { MainLayout } from '../..';
import { Button } from 'antd';

export default {
  title: 'Pages/DynamicPage',
  component: DynamicPage,
  argTypes: {}
} as Meta;

const DEFAULT_ARGS: IDynamicPageProps = {
  formId: { name: 'mazi-form-view' },
  id: 'a91b07fc-6f21-4fb5-a709-4f4357f1271f',
  mode: 'edit',
};

// Create a master template for mapping args to render the Button component
const Template: Story<IDynamicPageProps> = args => (
  <StoryApp>
    <MainLayout>
      <DynamicPage {...args} />
    </MainLayout>
  </StoryApp>
);

// Reuse that template for creating different stories
export const Basic = Template.bind({});

export const TestSubform = addStory(Template, {
  formId: { name: 'personal-details-and-address', module: 'shesha' },
  id: '28876571-4f62-4df0-9f03-fffe74f463f4',
  mode: 'edit',
});

export const BugFix = addStory(Template, {
  formId: { name: 'home-url-routes', module: 'Shesha' }
});

export const BugFix2 = addStory(Template, {
  formId: { name: 'notifications', module: 'Shesha' }  
});

export const BugFix3 = addStory(Template, {
  formId: { name: 'scheduled-job-details', module: 'Shesha' },
  id: '1ff7882e-0a3b-4f88-a8b3-c3c20afafbde',
  mode: 'edit'
});

export const FormLoadingRefactoringTable = addStory(Template, {
  formId: { name: 'cash-coverage-table', module: 'Boxfusion.His.Clients.Houghton' },
});

export const FormLoadingRefactoringDetails = addStory(Template, {
  formId: { name: 'cash-coverage-details', module: 'Boxfusion.His.Clients.Houghton' },
  id: 'c121972b-072f-4834-a4cd-019dff0a43a8',
});

export const FormsTest = addStory(Template, {
  formId: { name: 'form-details', module: 'shesha' },
  id: '439c337b-c2e3-4421-95c3-d9a2999e0b98',
});

export const TestUrls = addStory(Template, {
  formId: { module: 'Boxfusion.His.Clients.Houghton', name: 'cash-coverage-details' },
  //formId: '8621377c-b1de-43c6-819c-06bdfd555ddd',
  id: '598b83ab-808b-465b-9146-0736343faf84',
});

export const TestIndexPage = addStory(Template, {
  formId: { module: 'Boxfusion.His.Clients.Houghton', name: 'cash-coverage-table' },
});

export const WardDetailsPage = addStory(Template, {
  formId: { name: 'warddetails', module: 'Boxfusion.His.Clients.Houghton' },
  id: '1b38f1cf-df7a-4d46-8555-4362753d8e17',
});

export const UserManagementPage = addStory(Template, {
  formId: { name: 'user-management-new' },
});

export const SubFormPage = addStory(Template, {
  formId: { name: 'sub-form' },
  mode: 'edit',
});

export const PersonListPage = addStory(Template, {
  formId: { name: 'person-list' },
  //mode: 'edit',
});

export const FormsIndexPage = addStory(Template, {
  formId: { name: 'forms', module: 'shesha' },
  mode: 'edit',
});

export const FormDetailsPage = addStory(Template, {
  formId: { name: 'form-details', module: 'Shesha' },
  mode: 'readonly',
  id: 'ca8eb327-c110-41f5-be92-06c0afa7a6d8',
});

export const FormsTemplatesIndexPage = addStory(Template, {
  formId: { name: 'form-templates', module: 'Shesha' },
  mode: 'edit',
});

export const FormTemplateDetailsPage = addStory(Template, {
  formId: { name: 'form-template-details', module: 'Shesha' },
  mode: 'edit',
});

export const ModulesIndexPage = addStory(Template, {
  formId: { name: 'modules', module: 'Shesha' },
  mode: 'edit',
});

export const ModuleDetailsPage = addStory(Template, {
  formId: { name: 'module-details', module: 'Shesha' },
  mode: 'edit',
});

export const MissingPage = addStory(Template, {
  formId: { name: 'dummy' },
  mode: 'edit',
});

export const WizardForm = addStory(Template, {
  formId: { name: 'mazi-form-view' },
  mode: 'edit',
});

export const WizardDebugForm = addStory(Template, {
  formId: {
    name: 'mazi-form-view-debug',
  },
});

export const PersonDetailsPage = addStory(Template, {
  formId: { name: 'person-details', module: 'Test Module' },
  id: '98273D2D-F59E-42A3-9D8A-0218874548A9',
  mode: 'edit',
});

export const PersonEdit = addStory(Template, {
  formId: { name: 'person-edit', module: 'Test Module' },
  mode: 'edit',
  id: '9B3CA718-B61B-495D-B1C9-B2DE50EBA130',
});

export const OrganisationEdit = addStory(Template, {
  formId: { name: 'organisation-edit', module: 'Test Module' },
  //id: '9A6C74F5-0EA0-432B-90BE-79F72CC71778',
  mode: 'edit',
});

export const PermissionedObject = addStory(Template, {
  formId: { name: '/permissionedObject/webapi' },
  mode: 'edit',
});

export const ModelConfigurationEdit = addStory(Template, {
  formId: { name: 'model-configuration-edit' },
  id: 'BD6F85B7-43C0-411A-BFBB-67E7D5754EE8',
  mode: 'edit',
});

export const WardsIndex = addStory(Template, {
  formId: {
    module: 'Boxfusion.His.Clients.Houghton',
    name: 'wardsTable',
  },
  mode: 'readonly',
});

export const RefListRefactornig = addStory(Template, {
  formId: {
    module: 'test',
    name: 'reflist-refactoring',
  },
  mode: 'edit',
});

export const Performance = addStory(Template, {
  formId: {
    module: 'Boxfusion.His.Clients.Houghton',
    name: 'billing-management-details',
  },
  mode: 'readonly',
  id: '0dee0b4a-48eb-4a81-86f1-192175c284ae',
});

export const ComplexModel = addStory(Template, {
  formId: {
    module: 'test',
    name: 'test-nested',
  },
  mode: 'readonly',
  id: '6a8c3704-8aca-4878-8db6-f4f55d5cc5d5',
});

export const MissingForm = addStory(Template, {
  formId: {
    module: 'test',
    name: 'test-nested1',
  },
  mode: 'readonly',
  id: '6a8c3704-8aca-4878-8db6-f4f55d5cc5d5',
});

export const MissingEntity = addStory(Template, {
  formId: {
    module: 'test',
    name: 'test-nested',
  },
  mode: 'readonly',
  id: '6a8c3704-8aca-4878-8db6-f4f55d5cc555',
});
export const SettingsPage = addStory(Template, {
  formId: {
    module: 'StarterTemplate',
    name: 'settings-security',
  },
  mode: 'edit',
});
export const FormDetails = addStory(Template, {
  formId: {
    module: 'shesha',
    name: 'form-details',
  },
  id: 'a178c26c-2138-4ec9-8f5d-6bb9549f28f0',
  //shesha/form-details/?id=
  mode: 'edit',
});

export const ReferenceLists = addStory(Template, {
  formId: {
    module: 'shesha',
    name: 'reference-lists',
  },
});

export const ScheduledJobs = addStory(Template, {
  formId: {
    module: null,
    name: 'scheduled-job',
  },
});

export const HospitalAdmissionDetails = addStory(Template, {
  formId: {
    module: 'Boxfusion.His.Clients.Houghton',
    name: 'hospital-admission-details',
    version: 16,
  },
  id: '1390fb03-2c28-4730-ac02-23c3c041ce0b',
});

export const ReferenceListDetails = addStory(Template, {
  formId: {
    module: 'shesha',
    name: 'reference-lists-details',
  },
  id: 'd51c8c48-1a20-4053-977d-a10597a43b13',
  mode: 'readonly',
});

export const PayerEdit = addStory(Template, {
  formId: {
    module: 'Boxfusion.His.Clients.Houghton',
    name: 'facility-patient-flattened-table',
    version: 13,
  },
  //id: 'aecdd722-948a-456a-98b1-5968ea58f630',
});

export const HisAccountDetails = addStory(Template, {
  formId: {
    module: 'Boxfusion.His.Clients.Houghton',
    name: 'account-details',
    version: 11,
  },
  id: '6EF9A91C-62ED-46F0-86EE-0352989BF0F2',
  mode: 'edit'
});

Basic.args = DEFAULT_ARGS;

const Template2: Story<{}> = () => {
  const pages: IDynamicPageProps[] = [
    {
      formId: { name: 'form-details', module: 'test' },
      mode: 'edit',
      id: '265b4645-affe-4b4e-a364-3f0e8062eb80',
    },
    {
      formId: { name: 'modules', module: 'Shesha' },
      mode: 'edit',
    },
    {
      formId: { name: 'module-details', module: 'Shesha' },
      mode: 'edit',
      id: '8ab76d87-9c37-41ce-9919-34d7fc8828b3',
    },
    {
      formId: { name: 'forms', module: 'Shesha' },
      mode: 'edit',
    },
    {
      formId: { name: 'form-details', module: 'Shesha' },
      mode: 'edit',
      id: '4e8c53ea-1257-4f82-bafb-021f11b0dbfc',
    },
  ];
  const [page, setPage] = useState(0);

  const onClick = () => {
    const nextPage = page >= pages.length - 1 ? 0 : page + 1;
    setPage(nextPage);
  };

  return (
    <StoryApp>
      <MainLayout>
        <Button onClick={onClick}>Change</Button>
        <DynamicPage {...pages[page]} />
      </MainLayout>
    </StoryApp>
  );
};

export const Pages = addStory(Template2, {});
