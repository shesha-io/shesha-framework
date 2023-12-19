import React from 'react';
import { StoryFn } from '@storybook/react';
import ActionButtonGroup, { IActionButtonGroupProps } from '.';
import { IToolbarItem } from '../../interfaces';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default {
  title: 'Components/ActionButtonGroup',
  component: ActionButtonGroup,
  argTypes: {}
};

const onClick = () => console.log('Clicked!!!');

const toolbarItems: IToolbarItem[] = [
  {
    title: 'Save',
    icon: <CheckCircleOutlined />,
    onClick,
  },
  {
    title: 'Cancel',
    icon: <CloseCircleOutlined />,
    onClick,
  },
];

// Create a master template for mapping args to render the Button component
const Template: StoryFn<IActionButtonGroupProps> = args => <ActionButtonGroup items={toolbarItems} {...args} />;

// Reuse that template for creating different stories
export const Basic = Template.bind({});
Basic.args = {};