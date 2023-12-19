import React, { useRef } from 'react';
import { Story } from '@storybook/react';
import ConfigurationItemsExport from './';
import StoryApp from '@/components/storyBookApp';
import { addStory } from '@/stories/utils';
import { Modal } from 'antd';

export default {
  title: 'Components/ConfigurationItemsExport',
  component: ConfigurationItemsExport};

export interface IConfigurationItemsExportStoryProps {
  //backendUrl: string;
}

// Create a master template for mapping args to render the component
const Template: Story<IConfigurationItemsExportStoryProps> = () => {
  const exportRef = useRef();
  return (
    <StoryApp>
      <Modal
        open={true}
        title="Import Package"
        width='70%'
      >
        <ConfigurationItemsExport exportRef={exportRef}></ConfigurationItemsExport>
      </Modal>
    </StoryApp>
  );
};

export const Base = addStory(Template, {
  
});