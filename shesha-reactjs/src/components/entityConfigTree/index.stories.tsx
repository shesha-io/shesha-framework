import AuthContainer from '@/components/authedContainer';
import EntityConfigTree from '.';
import React from 'react';
import { addStory } from '@/stories/utils';
import { GlobalStateProvider, ShaApplicationProvider } from '@/providers';
import { Story } from '@storybook/react';
import './index.less';

export default {
  title: 'Components/EntityConfigTree',
  component: EntityConfigTree
};

export interface IEntityConfigStoryProps {
}

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

// Create a master template for mapping args to render the component
const Template: Story<IEntityConfigStoryProps> = () => {
  return (
    <GlobalStateProvider>
      <ShaApplicationProvider backendUrl={backendUrl}>
        <AuthContainer layout>
          <div id='test' className='treeContainer'>
            <EntityConfigTree></EntityConfigTree>  
          </div>
        </AuthContainer>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
};

export const Base = addStory(Template, {});
