import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import NotesRenderer, { INotesRendererProps } from './';
import { NotesProvider } from '../../providers';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/Temp/NotesRenderer',
  component: NotesRenderer,
} as Meta;

const customFileProps: INotesRendererProps = {};

// Create a master template for mapping args to render the Button component
const Template: Story<INotesRendererProps> = args => (
  <StoryApp>
    <NotesProvider ownerId="32e2b3dd-4d99-4542-af71-134ec7c0e2ce" ownerType="Shesha.Core.Person" {...args}>
      <NotesRenderer />
    </NotesProvider>
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = { ...customFileProps };
