import React, { useRef } from 'react';
import { Story } from '@storybook/react';
import ConfigurableForm from '.';
import { Button, Col, Form, Row } from 'antd';
import { IConfigurableFormProps } from './models';
import { addStory } from '@/stories/utils';
import { ConfigurableFormInstance } from '@/providers/form/contexts';
import StoryApp from '@/components/storyBookApp';

export default {
  title: 'Components/ConfigurableForm',
  component: ConfigurableForm,
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
            onValuesChange={(data) => console.log('onValuesChange data: ', data)}
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
                "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable." +
                "If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. " +
                'All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. ' +
                'It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.',
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

export const Notifications = addStory(DualModeForm, {
  formId: {
    name: 'notifications',
    module: 'Shesha',
  },
  mode: 'edit',
});
