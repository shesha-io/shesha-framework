import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import AutocompleteTagGroup, { IAutocompleteTagGroupProps } from './';
import { GlobalStateProvider, ShaApplicationProvider } from '@/components/..';
import AuthContainer from '@/components/authedContainer';

export default {
  title: 'Components/AutocompleteTagGroup',
  component: AutocompleteTagGroup
} as Meta;

const INITIAL_VALUES = ['app:Configurator', 'app:Roles', 'app:Dashboard'];

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

//#region Default
const BasicTemplate: Story<IAutocompleteTagGroupProps> = args => {
  const [values, setValues] = useState(INITIAL_VALUES);

  return (
  <GlobalStateProvider>
    <ShaApplicationProvider backendUrl={backendUrl}>
      <AuthContainer layout>
        <AutocompleteTagGroup {...args} value={values} onChange={setValues} />
      </AuthContainer>
    </ShaApplicationProvider>
  </GlobalStateProvider>
  );
};

export const Basic = BasicTemplate.bind({});
//#endregion
