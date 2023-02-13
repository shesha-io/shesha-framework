import React from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import { DataTableProvider, SidebarMenuDefaultsProvider } from '../../providers';
import DefaultLayout, { IDefaultLayoutProps } from './';
// import { SIDEBAR_MENU_ITEMS } from './menuItems';
import Page from '../page';
import IndexTableFull from '../indexTableFull';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/DefaultLayout',
  component: DefaultLayout,
} as Meta;

const defaultProps: IDefaultLayoutProps = {};

//#region Default template
// Create a master template for mapping args to render the Button component
const BasicExampleTemplate: Story<IDefaultLayoutProps> = () => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <DefaultLayout __hideHeader>
        <div>This is a div</div>
      </DefaultLayout>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);
export const BasicExample = BasicExampleTemplate.bind({});

BasicExample.args = { ...defaultProps };
//#endregion

//#region Default template
// Create a master template for mapping args to render the Button component
const WithPageTemplate: Story<IDefaultLayoutProps> = () => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <DefaultLayout __hideHeader>
        <Page title="Story Page">
          <div>This is a div</div>
        </Page>
      </DefaultLayout>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);
export const WithPage = WithPageTemplate.bind({});

WithPage.args = { ...defaultProps };
//#endregion
//#region Default template
// Create a master template for mapping args to render the Button component
const WithTableTemplate: Story<IDefaultLayoutProps> = () => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <DefaultLayout __hideHeader>
        <Page noPadding>
          <DataTableProvider tableId="Users_Index" title="Story Page">
            <IndexTableFull id={'Users_Index'} />
          </DataTableProvider>
        </Page>
      </DefaultLayout>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);
export const WithTable = WithTableTemplate.bind({});

WithTable.args = { ...defaultProps };
//#endregion
