import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ConfigurableLogo from './';
import { AppEditModeToggler } from '../..';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/ConfigurableLogo',
  component: ConfigurableLogo,
} as Meta;

export interface IConfigurableLogoStoryProps {
  backendUrl: string;
}

// Create a master template for mapping args to render the component
const Template: Story<IConfigurableLogoStoryProps> = () => (
  <StoryApp layout={false}>
    <AppEditModeToggler />
    <ConfigurableLogo />
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = {
  backendUrl: process.env.STORYBOOK_BASE_URL,
};
