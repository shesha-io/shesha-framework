import React from 'react';
import { Story, Meta } from '@storybook/react';
import { addStory } from '../../stories/utils';
import HierarchicalCheckList from '.';

export default {
  title: 'Components/HierarchicalCheckList',
  component: HierarchicalCheckList
} as Meta;

export interface IHierarchicalCheckListStoryProps {
}

const Template: Story<IHierarchicalCheckListStoryProps> = (_props) => {
  return (
    <HierarchicalCheckList 
      id={''} 
      ownerType={''}
    />
  );
};

export const Base = addStory(Template, {
  
});
