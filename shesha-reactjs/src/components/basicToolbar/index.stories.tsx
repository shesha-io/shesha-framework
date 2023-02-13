import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { ICustomFileProps } from '../customFile';
import BasicToolbar from '.';
import { StepBackwardFilled, StepForwardOutlined } from '@ant-design/icons';

export default {
  title: 'Components/BasicToolbar',
  component: BasicToolbar,
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
