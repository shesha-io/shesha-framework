import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import EntityConfigTree from '.';
import { GlobalStateProvider, ShaApplicationProvider } from '../..';
import AuthContainer from '../authedContainer';
import { addStory } from '../../stories/utils';
import './index.less';

export default {
  title: 'Components/EntityConfigTree',
  component: EntityConfigTree,
} as Meta;

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
}

export const Base = addStory(Template, {});
