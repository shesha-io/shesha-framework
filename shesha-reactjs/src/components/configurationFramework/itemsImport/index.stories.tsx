import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ConfigurationItemsImport from './';
import StoryApp from '../../storyBookApp';
import { addStory } from '../../../stories/utils';
import { Modal } from 'antd';

export default {
  title: 'Components/ConfigurationItemsImport',
  component: ConfigurationItemsImport,
} as Meta;

export interface IConfigurationItemsImportStoryProps {
  //backendUrl: string;
}

// Create a master template for mapping args to render the component
const Template: Story<IConfigurationItemsImportStoryProps> = () => {
  return (
    <StoryApp>
      <Modal
        open={true}
        title="Import Package"
        width='70%'
      >
        <ConfigurationItemsImport></ConfigurationItemsImport>
      </Modal>
    </StoryApp>
  );
};

export const Base = addStory(Template, {

});