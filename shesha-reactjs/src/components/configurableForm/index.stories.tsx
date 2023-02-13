import React, { useRef } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ConfigurableForm from '.';
import { Button, Col, Form, Row } from 'antd';
import { IConfigurableFormProps } from './models';
import { StoredFilesProvider } from '../../providers';
import { IndexPageTemplate } from './stories/indexPage';
import StoredFilesRenderer from '../storedFilesRenderer';
import { addStory } from '../../stories/utils';
import { ConfigurableFormInstance } from '../../providers/form/contexts';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/ConfigurableForm',
  component: ConfigurableForm,
} as Meta;

const configurableFormProps: IConfigurableFormProps = {
  mode: 'edit',
};

// Create a master template for mapping args to render the Button component
const BasicTemplate: Story<IConfigurableFormProps> = ({ formId, mode }) => {
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    console.log('onFinish data: ', data);
    console.log('onFinish data: ', JSON.stringify(data, null, 2));
  };

  return (
    <StoryApp>
      <Row>
        <Col span={24}>
          <ConfigurableForm
            mode={mode}
            formId={formId}
            onFinish={onFinish}
            form={form}
            sections={{
              middleSection: () => (
                <StoredFilesProvider ownerId="0bfb4b64-3e83-4765-802d-7f98601c2453" ownerType="BursMan.PaymentPack">
                  <StoredFilesRenderer isDragger={false} />
                </StoredFilesProvider>
              ),
            }}
            initialValues={{
              firstName: 'Some',
              lastName: 'One',
              scheduleDateStart: '2021-10-30T00:40:40.317Z',
              scheduleDateEnd: '2021-09-12T00:40:40.317Z',
              scheduleDate: ['2021-10-30T00:40:40.317Z', '2021-09-12T00:40:40.317Z'],
              gender: [{ itemValue: 1 }],
              numOfStudents: 23232,
              numOfTeachers: 131,
              numOfClasses: 75,
              numOfOfficers: 16,
              numOfRepeatingStudents: 37,
              numOfNewStudents: 200,
              numOfMatricStudents: 102,
            }}
          />

          <Button onClick={() => form?.submit()} type="primary">
            Submit
          </Button>
        </Col>
      </Row>
    </StoryApp>
  );
};
// Create a master template for mapping args to render the Button component
const DualModeForm: Story<IConfigurableFormProps> = ({ formId, mode = 'readonly' }) => {
  const formRef = useRef<ConfigurableFormInstance>();
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    console.log('onFinish data: ', data);
    console.log('onFinish data: ', JSON.stringify(data, null, 2));
    formRef?.current?.setFormMode('readonly');
  };

  const switchToReadOnlyMode = () => {
    form?.submit();

    formRef?.current?.setFormMode('readonly');
  };

  return (
    <StoryApp>
      <Row>
        <Col span={24}>
          <ConfigurableForm
            mode={mode}
            formRef={formRef}
            formId={formId}
            onFinish={onFinish}
            onFieldsChange={data => console.log('onFieldsChange data: ', data)}
            onValuesChange={data => console.log('onValuesChange data: ', data)}
            form={form}
            initialValues={{
              firstName: 'Some',
              lastName: 'Name',
              status: 1,
              friend: {
                name: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
              },
              applicationStatus: [
                {
                  item: 'Draft',
                  itemValue: 1,
                },
                {
                  item: 'Awaiting Bursary Commitee',
                  itemValue: 4,
                },
              ],
              area: {
                id: '20ed061b-8140-44af-af63-a3483afc0565',
                displayText: 'Durban',
              },
              areas: [
                {
                  id: '05c6ef7c-043f-4f34-b071-c5868b5f5e88',
                  displayText: 'Amajuba',
                },
              ],
              gender: [
                {
                  item: 'Male',
                  itemValue: 1,
                },
                {
                  item: 'Female',
                  itemValue: 2,
                },
              ],
              age: 20,
              startDate: '2022-01-12T19:02:13+02:00',
              endDate: '2022-02-02T19:02:15+02:00',
              optIn: true,
              alerts: false,
              marketingEmails: true,
              message:
                "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.",
            }}
          />

          <Button onClick={switchToReadOnlyMode} type="primary">
            Submit
          </Button>
        </Col>
      </Row>
    </StoryApp>
  );
};

export const Basic = addStory(BasicTemplate, {
  ...configurableFormProps,
  formId: {
    name: '/settings/forms/playground',
  },
});

export const ReadOnly = addStory(DualModeForm, {
  // ...configurableFormProps,
  formId: {
    name: '/settings/forms/playground',
  },
  mode: 'readonly',
});

export const IndexPage = IndexPageTemplate.bind({});
IndexPage.args = {
  formPath: '/indexTable',
};

export const PersonEditTest = addStory(BasicTemplate, {
  ...configurableFormProps,
  formId: {
    name: 'person-form',
  },
});
