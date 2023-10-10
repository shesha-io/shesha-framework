import React from 'react';
import { StoryFn, Meta } from '@storybook/react';
import FormComponentSelector, { IFormComponentSelectorProps } from './';
import { Button, Form } from 'antd';
import StoryApp from 'components/storyBookApp';
import { addStory } from 'src/stories/utils';

export default {
  title: 'Components/FormComponentSelector',
  component: FormComponentSelector
} as Meta;

// Create a master template
const Template: StoryFn<IFormComponentSelectorProps> = args => {
  const [form] = Form.useForm();

  const onFinish = (data: any) => {
    console.log('data: ', data);
  };

  return (
    <StoryApp>
      <Form
        form={form}
        {...{
          labelCol: {
            xs: { span: 24 },
            md: { span: 8 },
            sm: { span: 8 },
          },
          wrapperCol: {
            xs: { span: 24 },
            md: { span: 8 },
            sm: { span: 8 },
          },
        }}
        onFinish={onFinish}
      >
        <Form.Item label="Component Selector" name="editor">
          <FormComponentSelector {...args} />
        </Form.Item>

        <div>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </div>
      </Form>
    </StoryApp>
  );
};

export const Inputs = addStory(Template, {
  componentType: 'input',
  noSelectionItem: { label: 'Not editable', value: null }
});

export const Outputs = addStory(Template, {
  componentType: 'output'
});