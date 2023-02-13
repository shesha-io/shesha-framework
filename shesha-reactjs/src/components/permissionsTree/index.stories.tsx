import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { addStory } from '../../stories/utils';
import { PermissionsTree, PermissionsTreeMode } from '.';
import { FormProvider, GlobalStateProvider, ShaApplicationProvider } from '../..';
import AuthContainer from '../authedContainer';

export default {
  title: 'Components/PermissionsTree',
  component: PermissionsTree,
} as Meta;

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

export interface IPermissionTreeStoryProps {
  value?: string[];
  updateKey?: string;
  onChange?: (values?: string[]) => void;
  /**
  * Whether this control is disabled
  */
   disabled?: boolean;
  /**
  * If true, the automplete will be in read-only mode. This is not the same sa disabled mode
  */
  readOnly?: boolean;
  height?: number;
  mode: PermissionsTreeMode;  
}

const Template: Story<IPermissionTreeStoryProps> = (props) => {
  return (
    <GlobalStateProvider>
        <ShaApplicationProvider backendUrl={backendUrl}>
            <AuthContainer layout>
                <FormProvider mode={'edit'}>
                  <PermissionsTree {...props} />
                </FormProvider>
            </AuthContainer>
        </ShaApplicationProvider>
    </GlobalStateProvider>                
  );
}

export const Base = addStory(Template, {
  mode: 'Select'
});