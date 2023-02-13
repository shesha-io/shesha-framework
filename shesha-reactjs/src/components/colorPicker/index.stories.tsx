import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import CollapsiblePanel, { ICollapsiblePanelProps } from '.';
import { Button, message } from 'antd';

export default {
  title: 'Components/CollapsiblePanel',
  component: CollapsiblePanel,
} as Meta;

const defaultProps: ICollapsiblePanelProps = {
  header: 'Default header',
};

const advancedProps: ICollapsiblePanelProps = {
  header: 'Advanced header',
  expandIconPosition: 'left',
  extra: (
    <Button size="small" onClick={() => message.success('Clicked successfully')}>
      Extra
    </Button>
  ),
};

const Template: Story<ICollapsiblePanelProps> = args => (
  <CollapsiblePanel {...args}>
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's
    standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a
    type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting,
    remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing
    Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of
    Lorem Ipsum.
  </CollapsiblePanel>
);

export const Basic = Template.bind({});

export const Advanced = Template.bind({});

Basic.args = { ...defaultProps };
Advanced.args = { ...advancedProps };
