import classNames from 'classnames';
import ConfigurableSidebarMenu from '@/components/configurableSidebarMenu';
import LayoutHeader from './header';
import LayoutHeading from '@/components/layoutHeading';
import NodeOrFuncRenderer, { ReactNodeOrFunc } from '@/components/nodeOrFuncRenderer';
import React, {
  CSSProperties,
  FC,
  Fragment,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo
  } from 'react';
import { IHtmlHeadProps } from '@/components/htmlHead';
import { Layout } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { MenuTheme } from 'antd/lib/menu/MenuContext';
import { SIDEBAR_COLLAPSE } from './constant';
import { SIDEBAR_MENU_NAME } from '@/shesha-constants';
import { useLocalStorage } from '@/hooks';
import { useSheshaApplication, useTheme } from '@/providers';
import { useSidebarMenuDefaults } from '@/providers/sidebarMenu';
import { withAuth } from '@/hocs';

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
  /**
   * Used to override image logo src
   */
  imgSrc?: string;
}

const DefaultLayout: FC<PropsWithChildren<IMainLayoutProps>> = (props) => {
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
    layoutBackgroundStyle = {},
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
    imgSrc,
  } = props;
  const { theme: themeFromStorage } = useTheme();
  const sidebarDefaults = useSidebarMenuDefaults();

  const { setGlobalVariables } = useSheshaApplication();

  const sideMenuTheme = themeFromStorage?.sidebar;

  const [collapsed, setCollapsed] = useLocalStorage(SIDEBAR_COLLAPSE, true);

  useEffect(() => {
    document.title = title || '';
  });

  const hasHeading = useMemo(() => {
    return Boolean(heading);
  }, [heading]);

  const isFixedHeading = useMemo(() => {
    return fixHeading && ((Boolean(title) && showHeading) || Boolean(heading));
  }, [heading, title, heading, showHeading]);

  const onCollapse = (value: boolean) => {
    setGlobalVariables({ isSideBarExpanded: !value });
    setCollapsed(value);
  };

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
        className="sha-main-sider"
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={<MenuTrigger collapsed={collapsed} />}
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
          <LayoutHeader collapsed={collapsed} customComponent={customComponent} imgSrc={imgSrc} />
        </Header>
        <Content className={classNames({ collapsed })} style={contentStyle}>
          <>
            {breadcrumb}
            <div className={classNames('sha-layout-heading', headingClass)}>
              {renderPageTitle()} {renderPageControls()}
            </div>

            <div
              className={classNames('sha-site-layout-background', headingClass, {
                'sha-site-layout-background-no-padding': noPadding,
              })}
              style={{ ...layoutBackgroundStyle, background: themeFromStorage?.layoutBackground }}
            >
              {toolbar && (
                <div className="sha-site-layout-toolbar">
                  <NodeOrFuncRenderer>{toolbar}</NodeOrFuncRenderer>
                </div>
              )}

              {children}
            </div>
          </>
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

/**
 * Returns the component wrapped up in a layout
 * @param page the page to be rendered within the layout
 * @returns the component wrapped up in a layout
 */
 export const getLayout = (page: ReactElement): JSX.Element => {
  return <MainLayout noPadding><>{page}</></MainLayout>;
};

export default MainLayout;
