import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import PermissionedObjectsTree from '.';
import { GlobalStateProvider, ShaApplicationProvider } from '../..';
import AuthContainer from '../authedContainer';
import { addStory } from '../../stories/utils';
import './index.less';

export default {
  title: 'Components/PermissionedObjectsTree',
  component: PermissionedObjectsTree,
} as Meta;

export interface IPermissionedObjectsConfiguratorStoryProps {
  type?: string 
}

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

// Create a master template for mapping args to render the component
//const Template: Story<IPermissionedObjectsConfiguratorStoryProps> =  (props) => (
const Template: Story<IPermissionedObjectsConfiguratorStoryProps> = (props) => {
  return (
    <GlobalStateProvider>
      <ShaApplicationProvider backendUrl={backendUrl}>
        <AuthContainer layout>
          <div id='test' className='treeContainer'>
            <PermissionedObjectsTree objectsType={props.type}></PermissionedObjectsTree>  
          </div>
        </AuthContainer>
      </ShaApplicationProvider>
    </GlobalStateProvider>
  );
}

export const Base = addStory(Template, {
  type: "Shesha.WebApi"
});
