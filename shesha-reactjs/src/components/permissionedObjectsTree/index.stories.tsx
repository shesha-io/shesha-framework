import PermissionedObjectsTree from '.';
import React from 'react';
import { addStory } from '@/stories/utils';
import { Story } from '@storybook/react';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/PermissionedObjectsTree',
  component: PermissionedObjectsTree
};

export interface IPermissionedObjectsConfiguratorStoryProps {
  type?: string;
}

// Create a master template for mapping args to render the component
//const Template: Story<IPermissionedObjectsConfiguratorStoryProps> =  (props) => (
const Template: Story<IPermissionedObjectsConfiguratorStoryProps> = (props) => {
  return (
    <StoryApp>
      <div id='test' className='treeContainer'>
        <PermissionedObjectsTree objectsType={props.type}></PermissionedObjectsTree>
      </div>
    </StoryApp>
  );
};

export const Base = addStory(Template, {
  type: "Shesha.WebApi"
});
