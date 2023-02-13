import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { ConfigurableForm, GenericDetailsPage } from '../..';
import { IGenericDetailsPageProps } from './detailsPage';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/CrudViews/ConfigurableForm',
  component: GenericDetailsPage,
} as Meta;

const id = '6743d48e-d67f-48ab-a3a2-10a32d448e08';
const configurableFormProps = {
  id,
};

// Create a master template for mapping args to render the Button component
const Template: Story<IGenericDetailsPageProps> = () => {
  // const { formItemLayout } = useUi();

  return (
    <StoryApp>
      <ConfigurableForm
        mode="edit"
        // {...formItemLayout}
        path={'test/form-designer-components'}
        onValuesChange={data => {
          console.log('data: ', data);
        }}
        initialValues={{
          ownerId: 'some-owner-id',
          checklistId: '1698feac-56c7-436a-9bf5-117d22bfca0f',
        }}
      />
    </StoryApp>
  );
};

export const Basic = Template.bind({});
Basic.args = { ...configurableFormProps };

// export const IndexPage = Template.bind({});
// IndexPage.args = {
//   backendUrl: backendUrl,
//   formPath: '/indexTable',
// };
