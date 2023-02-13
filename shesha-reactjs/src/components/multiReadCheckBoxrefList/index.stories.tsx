import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import MultiReadCheckBoxRefList, { IMultiReadCheckBoxRefListProps } from './';
import { Form } from 'antd';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/MultiReadCheckBoxRefList',
  component: MultiReadCheckBoxRefList,
} as Meta;

const multiReadCheckBoxRefListProps: IMultiReadCheckBoxRefListProps = {
  listName: 'Gender',
  listNamespace: 'Shesha.Core',
  display: 'boolean',
};

// Create a master template for mapping args to render the Button component
const Template: Story<IMultiReadCheckBoxRefListProps> = args => (
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
          <MultiReadCheckBoxRefList {...args} />
        </Form.Item>
      </Form>
    </div>
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = { ...multiReadCheckBoxRefListProps };
