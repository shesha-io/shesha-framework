import React from 'react';
import { Story, Meta } from '@storybook/react';
import { ICustomFileProps } from '../customFile';
import BasicToolbar from '.';
import { StepBackwardFilled, StepForwardOutlined } from '@ant-design/icons';

export default {
  title: 'Components/BasicToolbar',
  component: BasicToolbar
} as Meta;

const customFileProps: ICustomFileProps = {};

const Template: Story<ICustomFileProps> = args => (
  <BasicToolbar items={[
    {
      id: 'string',
      title: 'ReactNode',
      icon: <StepBackwardFilled />,
      tooltip: 'StepBackwardFilled Tooltip'
    },
    {
      id: 'string',
      title: 'ReactNode 2',
      icon: <StepForwardOutlined />,
      tooltip: 'StepForwardOutlined Tooltip'
    }
  ]} {...args} />
);

export const Basic = Template.bind({});

export const Advanced = Template.bind({});

Basic.args = { ...customFileProps };
