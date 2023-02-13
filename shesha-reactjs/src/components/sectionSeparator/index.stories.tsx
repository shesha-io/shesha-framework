import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import SectionSeparator, { ISectionSeparatorProps } from './';
import { Form, Input, InputNumber } from 'antd';

export default {
  title: 'Components/SectionSeparator',
  component: SectionSeparator,
} as Meta;

const sectionSeparatorProps: ISectionSeparatorProps = {
  title: 'Personal details',
};

// Create a master template for mapping args to render the Button component
const Template: Story<ISectionSeparatorProps> = args => {
  return (
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
      <SectionSeparator title="Personal details" {...args} />

      <Form.Item label="First name">
        <Input />
      </Form.Item>
      <Form.Item label="Last name">
        <Input />
      </Form.Item>
      <Form.Item label="Age name">
        <InputNumber />
      </Form.Item>
    </Form>
  );
};

export const BasicSectionSeparator = Template.bind({});
BasicSectionSeparator.args = { ...sectionSeparatorProps };
