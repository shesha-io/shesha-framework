import React, { CSSProperties, FC, Fragment, PropsWithChildren, ReactNode, useMemo, useEffect } from 'react';
import { Layout } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import LayoutHeader from './header';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import NodeOrFuncRenderer, { ReactNodeOrFunc } from '../nodeOrFuncRenderer';
import { IHtmlHeadProps } from '../htmlHead';
import LayoutHeading from '../layoutHeading';
import { withAuth } from '../../hocs';
import { useSidebarMenuDefaults } from '../../providers/sidebarMenu';
import ConfigurableSidebarMenu from '../configurableSidebarMenu';
import { useLocalStorage, useTheme } from '../..';
import { SIDEBAR_MENU_NAME } from '../../constants';

const { Header, Content, Footer, Sider } = Layout;

export interface IMenuTriggerProps {
  collapsed: boolean;
}

const MenuTrigger: FC<IMenuTriggerProps> = ({ collapsed }) => {
  return <span>{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}</span>;
};

export interface IMainLayoutProps extends IHtmlHeadProps {
  breadcrumb?: ReactNodeOrFunc;
  style?: CSSProperties;
  headerStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  layoutBackgroundStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  footer?: ReactNodeOrFunc;
  heading?: ReactNodeOrFunc;
  /**
   * @deprecated - if passed it will still be used, but the one from the ThemeProvider is the one being used
   */
  theme?: MenuTheme;
  fixHeading?: boolean;
  showHeading?: boolean;
  noPadding?: boolean;
  toolbar?: ReactNodeOrFunc;
  customComponent?: ReactNode;

  /**
   * @deprecated
   * Use headerControls instead
   */
  reference?: string;

  /**
   * Used to display the statuses of the entity as well as the reference numbers
   */
  headerControls?: ReactNodeOrFunc;
}

const DefaultLayout: FC<PropsWithChildren<IMainLayoutProps>> = props => {
  const {
    title,
    // description,
    // ogImage,
    // url,
    breadcrumb,
    children,
    style,
    headerStyle,
    contentStyle,
    layoutBackgroundStyle,
    footer,
    footerStyle,
    heading,
    fixHeading = false,
    showHeading = true,
    reference,
    noPadding = false,
    toolbar,
    headerControls,
    customComponent,
  } = props;
  const { theme: themeFromStorage } = useTheme();
  const sidebarDefaults = useSidebarMenuDefaults();

  const sideMenuTheme = themeFromStorage?.sidebar;

  const [collapsed, setCollapsed] = useLocalStorage('SIDEBAR_COLLAPSE', true);

  useEffect(() => {
    document.title = title || '';
  });

  const hasHeading = useMemo(() => {
    return Boolean(heading);
  }, [heading]);

  const isFixedHeading = useMemo(() => {
    return fixHeading && ((Boolean(title) && showHeading) || Boolean(heading));
  }, [heading, title, heading, showHeading]);

  const renderPageControls = () => {
    if (!headerControls && !reference) return null;

    return (
      <span style={{ minWidth: 'fit-content', margin: '0', marginRight: '1%' }}>
        <NodeOrFuncRenderer>{headerControls || reference}</NodeOrFuncRenderer>
      </span>
    );
  };

  const headingClass = {
    'has-heading': hasHeading || (Boolean(title) && showHeading),
    'fixed-heading': isFixedHeading,
  };

  // If there's a title but there's no heading, render a Simple heading component
  const renderPageTitle = (): ReactNode => {
    if (hasHeading) {
      return typeof heading === 'function' ? heading() : heading;
    }

    if (title && showHeading) {
      return <LayoutHeading title={title} />;
    }

    return <Fragment />;
  };

  return (
    <Layout style={style}>
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
        theme={sideMenuTheme}
      >
        <ConfigurableSidebarMenu
          theme={sideMenuTheme}
          name={SIDEBAR_MENU_NAME}
          isApplicationSpecific={true}
          defaultSettings={sidebarDefaults}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={headerStyle}>
          <LayoutHeader collapsed={collapsed} customComponent={customComponent} />
        </Header>
        <Content className={classNames({ collapsed })} style={contentStyle}>
          {breadcrumb}
          <div className={classNames('sha-layout-heading', headingClass)}>
            {renderPageTitle()} {renderPageControls()}
          </div>

          <div
            className={classNames('sha-site-layout-background', headingClass, {
              'sha-site-layout-background-no-padding': noPadding,
            })}
            style={layoutBackgroundStyle}
          >
            {toolbar && (
              <div className="sha-site-layout-toolbar">
                <NodeOrFuncRenderer>{toolbar}</NodeOrFuncRenderer>
              </div>
            )}

            {children}
          </div>
        </Content>

        {footer && (
          <Footer style={footerStyle}>
            <NodeOrFuncRenderer>{footer}</NodeOrFuncRenderer>
          </Footer>
        )}
      </Layout>
    </Layout>
  );
};

const MainLayout = withAuth(DefaultLayout);

export default MainLayout;
