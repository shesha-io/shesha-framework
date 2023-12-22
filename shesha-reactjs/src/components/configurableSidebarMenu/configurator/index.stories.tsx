import React from 'react';
import { Story } from '@storybook/react';
import SidebarConfigurator from './';
import StoryApp from '@/components/storyBookApp';
import { SidebarMenuConfiguratorProvider } from '@/providers/index';
import { Col, Row } from 'antd';
import { ISideBarMenuProps } from '../index';

import { ConfigurableApplicationComponent, ISettingsEditorProps } from '@/components/configurableComponent';
import { SidebarMenu } from '@/components/sidebarMenu';
import { SidebarMenuProvider } from '@/providers/sidebarMenu';
import { ComponentSettingsModal } from '@/components/configurableSidebarMenu/settingsModal';
import { addStory } from '@/stories/utils';
import { migrateToConfigActions } from '../migrations/migrateToConfigActions';

export default {
  title: 'Components/SidebarConfigurator',
  component: SidebarConfigurator
};

export interface IConfigurableSidebarMenuProps {
  //backendUrl: string;
}

// Create a master template for mapping args to render the component
const Template: Story<IConfigurableSidebarMenuProps> = () => (
  <StoryApp>
    <Row>
      <Col md={12} offset={2}>
        <SidebarMenuConfiguratorProvider items={[]}>
          <SidebarConfigurator />
        </SidebarMenuConfiguratorProvider>
      </Col>
    </Row>
  </StoryApp>
);

export const Basic = Template.bind({});
Basic.args = {};

const EmptySidebarProps: ISideBarMenuProps = {
  items: [],
};

const TestSidebar = () => {
  const editor = (editorProps: ISettingsEditorProps<ISideBarMenuProps>) => {
    return (
      <ComponentSettingsModal
        settings={editorProps.settings ?? EmptySidebarProps}
        onSave={editorProps.onSave}
        onCancel={editorProps.onCancel}
      />
    );
  };

  return (
    <ConfigurableApplicationComponent<ISideBarMenuProps>
      defaultSettings={EmptySidebarProps}
      settingsEditor={{
        render: editor,
      }}
      name='test-sidebar'
      isApplicationSpecific={false}
      migrator={m => m.add(1, prev => migrateToConfigActions(prev))}
    >
      {(componentState, BlockOverlay) => (
        <div className={`sidebar ${componentState.wrapperClassName}`}>
          <BlockOverlay />

          <SidebarMenuProvider items={componentState.settings?.items || []}>
            <SidebarMenu theme='light' />
          </SidebarMenuProvider>
        </div>
      )}
    </ConfigurableApplicationComponent>
  );
};

const FullTemplate: Story<IConfigurableSidebarMenuProps> = () => (
  <StoryApp>
    <Row>
      <Col md={12} offset={2}>
        <TestSidebar />
      </Col>
    </Row>
  </StoryApp>
);
export const Test = addStory(FullTemplate, { });