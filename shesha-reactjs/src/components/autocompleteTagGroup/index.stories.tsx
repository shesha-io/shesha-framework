import AutocompleteTagGroup, { IAutocompleteTagGroupProps } from './';
import React, { useState } from 'react';
import { Story } from '@storybook/react';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/AutocompleteTagGroup',
  component: AutocompleteTagGroup
};

const INITIAL_VALUES = ['app:Configurator', 'app:Roles', 'app:Dashboard'];

//#region Default
const BasicTemplate: Story<IAutocompleteTagGroupProps> = args => {
  const [values, setValues] = useState(INITIAL_VALUES);

  return (
    <StoryApp>
      <AutocompleteTagGroup {...args} value={values} onChange={setValues} />
    </StoryApp>
  );
};

export const Basic = BasicTemplate.bind({});
//#endregion
