import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import RefListRadioButtons, { IRefListRadioButtonsProps } from './';
import { Form } from 'antd';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/RefListRadioButtons',
  component: RefListRadioButtons,
  argTypes: {
    orientation: {
      control: {
        type: 'radio',
        options: ['inline', 'vertical'],
      },
    },
    optionType: {
      control: {
        type: 'radio',
        options: ['default', 'button'],
      },
    },
  },
} as Meta;

const autocompleteProps: IRefListRadioButtonsProps = {
  listName: 'Gender',
  listNamespace: 'Shesha.Core',
  orientation: 'inline',
  filters: [],
};

// Create a master template for mapping args to render the Button component
const Template: Story<IRefListRadioButtonsProps> = args => {
  const [value, setValue] = useState<number>();
  return (
    <StoryApp>
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
        <Form.Item label="RefListRadioButtons">
          <RefListRadioButtons value={value} {...args} onSelectionChange={setValue} />
        </Form.Item>
      </Form>
    </StoryApp>
  );
};

export const BasicRefListRadioButtons = Template.bind({});
BasicRefListRadioButtons.args = { ...autocompleteProps };
