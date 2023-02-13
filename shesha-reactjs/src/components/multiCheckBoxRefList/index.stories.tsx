import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import MultiCheckBoxRefList, { IMultiCheckBoxRefListProps } from './';
import { Form } from 'antd';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/MultiCheckBoxRefList',
  component: MultiCheckBoxRefList,
} as Meta;

const multiCheckBoxRefListProps: IMultiCheckBoxRefListProps = {
  listName: 'Gender',
  listNamespace: 'Shesha.Core',
};

// Create a master template for mapping args to render the Button component
const Template: Story<IMultiCheckBoxRefListProps> = args => (
  <StoryApp>
    <div style={{ width: 500 }}>
      <Form
        {...{
          labelCol: {
            xs: { span: 24 },
            md: { span: 8 },
            sm: { span: 8 },
          },
          wrapperCol: {
            xs: { span: 24 },
            md: { span: 16 },
            sm: { span: 16 },
          },
        }}
      >
        <Form.Item label="Select option">
          <MultiCheckBoxRefList {...args} />
        </Form.Item>
      </Form>
    </div>
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = { ...multiCheckBoxRefListProps };
