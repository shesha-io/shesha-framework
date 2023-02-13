import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { GenericDetailsPage, GenericIndexPage, SimpleIndexPage } from '../..';
import { IGenericIndexPageProps } from './indexPage';
import { useAreaCreate } from '../../apis/area';
import { PlusOutlined } from '@ant-design/icons';
import { OnSuccessActionType } from './createModal';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/CrudViews/IndexView',
  component: GenericDetailsPage,
} as Meta;

const id = '26f7507e-efa3-49eb-aa0c-775668f49370';

const configurableFormProps = {
  id,
};

// Create a master template for mapping args to render the Button component
const Template: Story<IGenericIndexPageProps> = () => {
  return (
    <StoryApp>
      <GenericIndexPage
        title="All Areas"
        tableConfigId="Areas_Index"
        createModalProps={{
          title: 'Add new area',
          formPath: '/areas/create',
          updater: useAreaCreate,
          OnSuccessAction: OnSuccessActionType.GoToUrl,
          onSuccessUrl: '/settings',
          submitButtonLabel: 'Submit',
        }}
      />
    </StoryApp>
  );
};

interface IRowSelectionState {
  selectedRowIndex?: number;
  row?: any;
  enableCreatePaymentPack?: boolean;
}

// Create a master template for mapping args to render the Button component
const RowSelectionsTemplate: Story<IGenericIndexPageProps> = () => {
  const [rowSelectionState, setRowSelectionState] = useState<IRowSelectionState>({});

  const onSelectRow = (index: number, row: any) => {
    setRowSelectionState({
      selectedRowIndex: index,
      row,
    });
  };

  // console.log('rowSelectionState: ', rowSelectionState);

  return (
    <StoryApp>
      <SimpleIndexPage
        title="All Payments"
        tableConfigId="Invoice_Index"
        toolbarItems={[
          {
            title: 'Create Payment Pack',
            icon: <PlusOutlined />,
            disabled: !rowSelectionState?.enableCreatePaymentPack,
          },
        ]}
        onSelectRow={onSelectRow}
        selectedRowIndex={rowSelectionState.selectedRowIndex}
      />
    </StoryApp>
  );
};

export const Basic = Template.bind({});
Basic.args = { ...configurableFormProps };

export const IndexPage = Template.bind({});
IndexPage.args = {
  formPath: '/indexTable',
};

export const WithRowSelectionsTemplate = RowSelectionsTemplate.bind({});
WithRowSelectionsTemplate.args = { ...configurableFormProps };
// tableConfigId="Invoice_Index" title="All Invoices"
//             createModalProps={{
//               updater: useAreaCreate,
//               formPath: '/areas/create',
//               // keepModalOpenAfterSave: true,
//               title:"Add new area"
//             }}

//             tableRowSelectionProps={{
//               selectedRowIndex: rowSelectionState?.selectedRowIndex,
//               // onSelectRow: rowSelectionState?.row,
//               onSelectRow,
//             }}
