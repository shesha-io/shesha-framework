import React from 'react';
import { Story } from '@storybook/react';
import ConfigurableLogo from './';
import { AppEditModeToggler } from '@/components/..';
import StoryApp from '@/components/storyBookApp';

export default {
  title: 'Components/ConfigurableLogo',
  component: ConfigurableLogo
};

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
