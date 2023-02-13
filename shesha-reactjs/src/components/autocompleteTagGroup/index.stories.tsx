import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import AutocompleteTagGroup, { IAutocompleteTagGroupProps } from './';
import { GlobalStateProvider, ShaApplicationProvider } from '../..';
import AuthContainer from '../authedContainer';

export default {
  title: 'Components/AutocompleteTagGroup',
  component: AutocompleteTagGroup,
} as Meta;

const INITIAL_VaLUES = ['app:Configurator', 'app:Roles', 'app:Dashboard'];

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

//#region Default
const BasicTemplate: Story<IAutocompleteTagGroupProps> = args => {
  const [values, setValues] = useState(INITIAL_VaLUES);

  return (
  <GlobalStateProvider>
    <ShaApplicationProvider backendUrl={backendUrl}>
      <AuthContainer layout>
        <AutocompleteTagGroup {...args} value={values} onChange={setValues} />
      </AuthContainer>
    </ShaApplicationProvider>
  </GlobalStateProvider>
  )
};

export const Basic = BasicTemplate.bind({});
//#endregion
