import React from 'react';
import { Story } from '@storybook/react';
import IconPicker, { IIconPickerProps } from './';
import { Form } from 'antd';

export default {
  title: 'Components/IconPicker',
  component: IconPicker,
  argTypes: {
    selectBtnSize: {
      control: {
        type: 'radio',
        options: ['middle', 'small', 'large'],
      },
    },
  }
};

const iconPickerProps: IIconPickerProps = {
  value: 'AlignCenterOutlined',
  selectBtnSize: 'middle',
};

// Create a master template for mapping args to render the Button component
const Template: Story<IIconPickerProps> = args => (
  <Form>
    <Form.Item label="Icon picker label">
      <IconPicker {...args} />
    </Form.Item>
  </Form>
);

export const BasicIconPicker = Template.bind({});
BasicIconPicker.args = { label: 'Message only', ...iconPickerProps };
