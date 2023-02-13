
# Storybook

![Storybook%20Logo screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/Storybook%20Logo.jpg?raw=true)

## Overview

[Storybook](https://storybook.js.org/) is an open source tool for building UI components and pages in isolation. It streamlines UI development, testing, and documentation.

## Getting Started

In this tutorial we will introduce you to Storybook and how to get productive and working within it. 

This guide requires you to have completed the [Shesha React JS Guide](https://shesha-docs.readthedocs.io/en/latest/guides/02-Shesha-ReactJS/) so that you have storybook ready to work with. 

You should be able to view the following page which was run using the following command in Shesha React JS.

``` shell
npm run storybook
```

![Storybook-landing-page screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/Storybook-landing-page.PNG?raw=true)

## Creating Pages for Components

### Storybook Introduction Page

Each component you create on storybook needs to have an introduction page, we use this page to describe what the component is and how we use the component.

![shesha-reactjs-storybook screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/shesha-reactjs-storybook.PNG?raw=true)

This page can be found in the Shesha React JS source code under the following name

``` shell
index.en-US.stories.mdx
```
![storybook-index screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/storybook-index.PNG?raw=true)

When creating new components on Shesha React JS please ensure to create a storybook introduction to the component so that its easy to understand the use cases for each component at a glance. 

### Storybook Component Pages

It's possible to create multiple pages for components in storybook, we use these pages where there are multiple scenario's for components. 

For example if we have a component that has a basic functionality such as a dropdown container displaying a button group we can view the "Basic" page. However if there are scenarios where a component can become quite complex such as a dropdown container with added functionality such as filtering, auto-collapsing or even dynamic data that is displayed we can add as many pages as we need to dive deeper and explain multiple levels of complexity. 

The following image is an example of a component with multiple pages to display different levels of complexity. 

![storybook-multiple-pages screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/storybook-multiple-pages.PNG?raw=true)

As you can see in the above image we have the Collapsible Panel which has a 'Basic' and 'Advanced' page for each.

We can do this by navigating to the following file in the Source code. 

``` shell
index.stories.tsx
```

![storybook-multiple-pages-source screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/storybook-multiple-pages-source.PNG?raw=true)

As you can see in the above image the Collapsible Panel's 'index.stories.tsx' file has the code which will display the component on Storybook. 

Here in particular we want to pay attention to two specific blocks of code.

``` shell
export const Basic = Template.bind({});
Basic.args = { ...defaultProps };
```

and

``` shell
export const Advanced = Template.bind({});
Advanced.args = { ...advancedProps };
```

These two lines indicate to storybook that we want two Stories or Pages for the component, one being 'Basic' and the other being 'Advanced'

Both of these stories use the component template which will display the component and the text within the Collapsible Panel.

``` shell
const Template: Story<ICollapsiblePanelProps> = args => (
  <CollapsiblePanel  {...args} >
    Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
  </CollapsiblePanel>
);
```

Where each page gets its identity is through the props added to each template such as:

``` shell
const advancedProps: ICollapsiblePanelProps = {
  header: 'Advanced header',
  expandIconPosition: 'left'
};
```

We can create a third one for this guide to illustrate how we can add multiple more stories. 

Lets begin by adding the following block of code just underneath the 'Advanced' props. 

``` shell
const expertProps: ICollapsiblePanelProps = {
  header: 'Advanced header',
  expandIconPosition: 'left',
  noContentPadding: false,
  loading: true,
};
```

And then lets add the next block of code right at the bottom of the page. 

``` shell
export const Expert = Template.bind({});
Advanced.args = { ...expertProps };
```

Your file should now look something like this.

![storybook-multiple-pages-adding-new.PNG screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/storybook-multiple-pages-adding-new.PNG?raw=true)

Now lets hit save and you will see your terminal will begin to build. 

Lets navigate back to Storybook which will be open in your browser and you can now see that we have a new page added to the component!

![storybook-multiple-pages-expert-page.PNG screenshot](https://github.com/Boxfusion/shesha-docs/blob/main/docs/assets/storybook-multiple-pages-expert-page.PNG?raw=true)

Congratulations, you have now learnt the basics of Storybook and correctly documenting and adding pages to your components.

