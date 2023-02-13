import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { addStory } from '../../stories/utils';
import HierarchicalCheckList from '.';

export default {
  title: 'Components/HierarchicalCheckList',
  component: HierarchicalCheckList,
} as Meta;

export interface IHierarchicalCheckListStoryProps {
}

const Template: Story<IHierarchicalCheckListStoryProps> = (props) => {
  return (
    <HierarchicalCheckList 
      id={''} 
      ownerType={''}
    />
  );
}

export const Base = addStory(Template, {
  
});
