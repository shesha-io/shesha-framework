import React from 'react';
import { Story } from '@storybook/react';
import { SidebarMenuDefaultsProvider } from '@/providers';
import Page, { IBreadcrumbItem, IPageProps } from './';
import { ITagProps } from './pageHeaderTag';
import StoryApp from '@/components/storyBookApp';

export default {
  title: 'Components/Page',
  component: Page
};

const defaultProps: IPageProps = {
  title: 'Default layout',
};


const headerTagList: ITagProps[] = [
  {
    title: 'Date registered',
    tag: 'some tag',
  },
  {
    title: 'Payment Status',
    tag: {
      color: 'blue',
      text: 'PAID',
    },
  },
];

const breadcrumbItems: IBreadcrumbItem[] = [
  {
    text: 'Home',
    link: '#',
  },
  {
    text: 'Application Center',
    link: '#',
  },
  {
    text: 'Application List',
    link: '#',
  },
  {
    text: 'An Application',
  },
];

//#region Default
const BasicTemplate: Story<IPageProps> = args => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <Page {...args} title="Any title">
        <div>This is a div</div>
      </Page>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

export const Basic = BasicTemplate.bind({ ...defaultProps });
//#endregion

//#region WithToolBarItem
const WithToolBarItemTemplate: Story<IPageProps> = args => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <Page {...args} title="Any title">
        <div>This is a div</div>
      </Page>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

export const WithToolBarItem = WithToolBarItemTemplate.bind({ ...defaultProps });
//#endregion

//#region WithToolBarItem
const WithHeaderListTemplate: Story<IPageProps> = args => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <Page {...args} title="Any title" headerTagList={headerTagList}>
        <div>This is a div</div>
      </Page>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

export const WithHeaderList = WithHeaderListTemplate.bind({ ...defaultProps });
//#endregion

//#region WithToolBarItem
const WithBackButtonTemplate: Story<IPageProps> = args => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <Page {...args} title="Any title" backUrl="/">
        <div>This is a div</div>
      </Page>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

export const WithBackButton = WithBackButtonTemplate.bind({ ...defaultProps });
//#endregion

//#region WithToolBarItem
const CompleteExampleTemplate: Story<IPageProps> = args => (
  <StoryApp>
    <SidebarMenuDefaultsProvider items={[]}>
      <Page
        {...args}
        title="Any title"
        headerTagList={headerTagList}
        breadcrumbItems={breadcrumbItems}
        backUrl="/"
      >
        <div>This is a div</div>
      </Page>
    </SidebarMenuDefaultsProvider>
  </StoryApp>
);

export const CompleteExample = CompleteExampleTemplate.bind({ ...defaultProps });
//#endregion
