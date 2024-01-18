import EntityConfigTree from '.';
import React from 'react';
import { addStory } from '@/stories/utils';
import { Story } from '@storybook/react';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/EntityConfigTree',
  component: EntityConfigTree
};

export interface IEntityConfigStoryProps {
}

// Create a master template for mapping args to render the component
const Template: Story<IEntityConfigStoryProps> = () => {
  return (
    <StoryApp>
      <div id='test' className='treeContainer'>
        <EntityConfigTree></EntityConfigTree>
      </div>
    </StoryApp>
  );
};

export const Base = addStory(Template, {});
