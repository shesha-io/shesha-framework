import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import StoredFilesProvider from '../../providers/storedFiles';
import CustomFile, { ICustomFileProps } from '../customFile';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/Temp/CustomFile',
  component: CustomFile,
} as Meta;

const customFileProps: ICustomFileProps = {};

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

// Create a master template for mapping args to render the Button component
const Template: Story<ICustomFileProps> = args => (
  <StoryApp>
    <StoredFilesProvider
      ownerId="32e2b3dd-4d99-4542-af71-134ec7c0e2ce"
      ownerType="Shesha.Core.Person"
      filesCategory={1}
      baseUrl={backendUrl}
      {...args}
    >
      <div style={{ width: 500 }}>
        <CustomFile />
      </div>
    </StoredFilesProvider>
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = { ...customFileProps };
