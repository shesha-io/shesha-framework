import React, { useState } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import SidebarContainer, { ISidebarContainerProps } from './';
import { CollapsiblePanel } from '..';
import { Button } from 'antd';
import './styles/story.less';
import StoryApp from '../storyBookApp';

export default {
  title: 'Components/SidebarContainer',
  component: SidebarContainer,
  argTypes: {},
} as Meta;

const sharedProps: ISidebarContainerProps = {
  allowFullCollapse: false,
};

const backendUrl = process.env.STORYBOOK_BASE_URL; // TODO: Make this configurable

//#region Basic usage
const TemplateBasic: Story<ISidebarContainerProps> = args => {
  const [state, setState] = useState<IStoryState>({
    leftSidebarOpen: true,
    rightSidebarOpen: true,
  });

  const toggleLeftSidebarVisibility = () => setState({ ...state, leftSidebarOpen: !state.leftSidebarOpen });

  const toggleRightSidebarVisibility = () => setState({ ...state, rightSidebarOpen: !state.rightSidebarOpen });

  return (
    <StoryApp>
      <SidebarContainer
        {...args}
        title="Any title"
        leftSidebarProps={{
          open: state.leftSidebarOpen,
          title: 'Left title',
          content: <div>Content of the left sidebar goes here</div>,
          onOpen: toggleLeftSidebarVisibility,
          onClose: toggleLeftSidebarVisibility,
        }}
        rightSidebarProps={{
          open: state.rightSidebarOpen,
          title: 'Right title',
          content: <div>Content of the right sidebar goes here</div>,
          onOpen: toggleRightSidebarVisibility,
          onClose: toggleRightSidebarVisibility,
        }}
      />
    </StoryApp>
  );
};

export const Basic = TemplateBasic.bind({});
Basic.args = { ...sharedProps, rightSidebarOnly: true };
//#endregion

//#region Left sidebar only use case
const TemplateLeftSidebarOnly: Story<ISidebarContainerProps> = args => {
  const [state, setState] = useState<IStoryState>({
    leftSidebarOpen: true,
  });

  const toggleLeftSidebarVisibility = () => setState({ ...state, leftSidebarOpen: !state.leftSidebarOpen });

  return (
    <StoryApp>
      <SidebarContainer
        {...args}
        title="Any title"
        leftSidebarProps={{
          open: state.leftSidebarOpen,
          title: 'Left title',
          content: <div>Content of the left sidebar goes here</div>,
          onOpen: toggleLeftSidebarVisibility,
          onClose: toggleLeftSidebarVisibility,
        }}
      />
    </StoryApp>
  );
};

export const LeftSidebarOnly = TemplateLeftSidebarOnly.bind({});
TemplateLeftSidebarOnly.args = {};
//#endregion

//#region Right sidebar only use case
const TemplateRightSidebarOnly: Story<ISidebarContainerProps> = args => {
  const [state, setState] = useState<IStoryState>({
    rightSidebarOpen: true,
  });

  const toggleRightSidebarVisibility = () => setState({ ...state, rightSidebarOpen: !state.rightSidebarOpen });

  return (
    <StoryApp>
      <SidebarContainer
        {...args}
        title="Any title"
        rightSidebarProps={{
          open: state.rightSidebarOpen,
          title: 'Right title',
          content: <div>Content of the right sidebar goes here</div>,
          onOpen: toggleRightSidebarVisibility,
          onClose: toggleRightSidebarVisibility,
        }}
      />
    </StoryApp>
  );
};

export const RightSidebarOnly = TemplateRightSidebarOnly.bind({});
TemplateRightSidebarOnly.args = { ...sharedProps };
//#endregion

//#region Advancded examples
interface IStoryState {
  leftSidebarOpen?: boolean;
  rightSidebarOpen?: boolean;
}

const TemplateAdvanced: Story<ISidebarContainerProps> = args => {
  const [state, setState] = useState<IStoryState>({
    leftSidebarOpen: true,
    rightSidebarOpen: true,
  });

  const toggleLeftSidebarVisibility = () => setState({ ...state, leftSidebarOpen: !state.leftSidebarOpen });

  const toggleRightSidebarVisibility = () => setState({ ...state, rightSidebarOpen: !state.rightSidebarOpen });

  return (
    <StoryApp>
      <SidebarContainer
        {...args}
        title="Any title"
        // allowFullCollapse
        leftSidebarProps={{
          open: state.leftSidebarOpen,
          title: 'Left title',
          content: <div>Content of the left sidebar goes here</div>,
          onOpen: toggleLeftSidebarVisibility,
          onClose: toggleLeftSidebarVisibility,
        }}
        rightSidebarProps={{
          open: state.rightSidebarOpen,
          title: 'Right title',
          content: <div>Content of the right sidebar goes here</div>,
          onOpen: toggleRightSidebarVisibility,
          onClose: toggleRightSidebarVisibility,
        }}
      >
        <CollapsiblePanel header="Sidebar Container Content">
          <h4>
            Use these buttons to Show/Hide the side containers when 'AllowFullCollapse' property has been set to true.
          </h4>
          <div className="sha-buttons-wrapper">
            <Button className="button" onClick={toggleLeftSidebarVisibility}>
              Toggle Left Sidebar Visible
            </Button>
            <Button onClick={toggleRightSidebarVisibility}>Toggle Right Sidebar Visible</Button>
          </div>
        </CollapsiblePanel>
      </SidebarContainer>
    </StoryApp>
  );
};

export const Advanced = TemplateAdvanced.bind({});
Advanced.args = { ...sharedProps };
//#endregion
