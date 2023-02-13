import React, { FC, PropsWithChildren, ReactElement, useEffect } from 'react';
import { Layout } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import DefaultLayoutHeader from './defaultLayoutHeader';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { useSidebarMenuDefaults } from '../../providers/sidebarMenu';
import ConfigurableSidebarMenu from '../configurableSidebarMenu';
import { Show, useLocalStorage, useTheme } from '../..';
import { SIDEBAR_MENU_NAME } from '../../constants';
import { useMediaQuery } from 'react-responsive';
import { TABLET_MD_SIZE_QUERY } from '../../constants/media-queries';

const { Header, Content, Sider } = Layout;

export interface IMenuTriggerProps {
  collapsed: boolean;
}

const MenuTrigger: FC<IMenuTriggerProps> = ({ collapsed }) => {
  return <span>{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</span>;
};

export interface IDefaultLayoutProps {
  theme?: MenuTheme;

  /**
   * Hack! Please do not use this property unless you know what you're doing. If true, it hides the layout header
   */
  __hideHeader?: boolean; //
}

// TODO: Check if including props from the layout will
// TODO not cause the app to misbehave, especially when navigating to other pages the layout

export const DefaultLayout: FC<PropsWithChildren<IDefaultLayoutProps>> = ({ children, __hideHeader = false }) => {
  const sidebarDefaults = useSidebarMenuDefaults();
  const { theme } = useTheme();

  const [collapsed, setCollapsed] = useLocalStorage('SIDEBAR_COLLAPSE', true);

  const showCollapsed = useMediaQuery({
    query: TABLET_MD_SIZE_QUERY,
  });

  useEffect(() => (showCollapsed ? setCollapsed(showCollapsed) : null), [showCollapsed]);


  return (
    <Layout>

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={<MenuTrigger collapsed={collapsed} />}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          paddingTop: '48px',
          left: 0,
        }}
        theme={theme?.sidebar}
      >
        <ConfigurableSidebarMenu
          theme={theme?.sidebar} 
          name={SIDEBAR_MENU_NAME}
          isApplicationSpecific={true}
          defaultSettings={sidebarDefaults}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background">
          <Show when={!__hideHeader}>
            <DefaultLayoutHeader collapsed={collapsed} />
          </Show>
        </Header>

        <Content className={classNames({ collapsed })}>{children}</Content>
      </Layout>

    </Layout>
  );
};

export function getDefaultLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
}

export default DefaultLayout;
