import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { IToolbarItem } from '../../interfaces';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ActionButtonGroup, { IActionButtonGroupProps } from '../actionButtonGroup';

export default {
  title: 'Components/Views',
  component: ActionButtonGroup,
  argTypes: {},
} as Meta;

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
const Template: Story<IActionButtonGroupProps> = args => <ActionButtonGroup items={toolbarItems} {...args} />;

// Reuse that template for creating different stories
export const Basic = Template.bind({});
Basic.args = {};
