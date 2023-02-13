import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { GenericDetailsPage, GenericIndexPage } from '../..';
import { IGenericIndexPageProps } from '../crudViews/indexPage';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/MainLayout',
  component: GenericDetailsPage,
} as Meta;

const id = '26f7507e-efa3-49eb-aa0c-775668f49370';

const configurableFormProps = {
  id,
};

// Create a master template for mapping args to render the Button component
const Template: Story<IGenericIndexPageProps> = () => {
  return (
    <StoryApp>
      <GenericIndexPage
        title="Members"
        tableConfigId="Members_Index"
        // tableConfigId="Members_Index"
        detailsUrl={currentId => `/members/details?id=${currentId}`}
        editUrl={currentId => `/members/edit?id=${currentId}`}
      />
    </StoryApp>
  );
};

export const Basic = Template.bind({});
Basic.args = { ...configurableFormProps };

export const IndexPage = Template.bind({});

IndexPage.args = {
  formPath: '/indexTable',
};
