/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
"use client";
import ConfigurableSidebarMenu from '@/components/configurableSidebarMenu';
import { IHtmlHeadProps } from '@/components/htmlHead';
import LayoutHeading from '@/components/layoutHeading';
import NodeOrFuncRenderer, { ReactNodeOrFunc } from '@/components/nodeOrFuncRenderer';
import { withAuth } from '@/hocs';
import { useLocalStorage } from '@/hooks';
import { FormFullName, useTheme } from '@/providers';
import { SIDEBAR_MENU_NAME } from '@/shesha-constants';
import { isDefined, isNullOrWhiteSpace } from '@/utils';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import classNames from 'classnames';
import * as React from 'react';
import {
  CSSProperties,
  FC,
  Fragment,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';
import { ConfigurableForm } from '../configurableForm';
import { SIDEBAR_COLLAPSE } from './constant';
import LayoutHeader from './header';
import { useStyles } from './styles/styles';

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
  contentStyle?: CSSProperties;
  layoutBackgroundStyle?: CSSProperties;
  footerStyle?: CSSProperties;
  footerFormId?: FormFullName;
  heading?: ReactNodeOrFunc;
  showHeading?: boolean;
  /** @deprecated */
  noPadding?: boolean;
  /**
   * Used to display the statuses of the entity as well as the reference numbers
   */
  headerControls?: ReactNodeOrFunc;
  headerFormId?: FormFullName;
}

const DefaultLayout: FC<PropsWithChildren<IMainLayoutProps>> = (props) => {
  const {
    title,
    breadcrumb,
    children,
    style,
    contentStyle,
    layoutBackgroundStyle = {},
    footerFormId,
    footerStyle,
    heading,
    showHeading = true,
    headerControls,
    headerFormId,
  } = props;
  const { theme: themeFromStorage } = useTheme();
  const { styles } = useStyles();

  const sideMenuTheme = themeFromStorage.sidebar;

  const [collapsed, setCollapsed] = useLocalStorage(SIDEBAR_COLLAPSE, true);

  useEffect(() => {
    if (!isNullOrWhiteSpace(title)) document.title = title;
  }, [title]);

  // Update CSS custom property for dynamic header height
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let lastHeight = 0;

    const updateHeaderHeight = (): void => {
      const headerElement = document.querySelector('.ant-layout-header');
      if (headerElement) {
        const actualHeight = headerElement.getBoundingClientRect().height;
        // Only update if height actually changed to avoid unnecessary DOM writes
        if (actualHeight !== lastHeight) {
          lastHeight = actualHeight;
          document.documentElement.style.setProperty('--sha-header-height', `${actualHeight}px`);
        }
      }
    };

    // Debounced update function
    const debouncedUpdate = (): void => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateHeaderHeight, 16); // ~60fps
    };

    // Initial update
    setTimeout(updateHeaderHeight, 100); // Delay to ensure elements are rendered

    // Set up ResizeObserver to watch for header height changes
    const headerElement = document.querySelector('.ant-layout-header');
    let resizeObserver: ResizeObserver | undefined;

    if (headerElement) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const actualHeight = entry.contentRect.height;
          // Only update if height actually changed
          if (actualHeight !== lastHeight) {
            lastHeight = actualHeight;
            document.documentElement.style.setProperty('--sha-header-height', `${actualHeight}px`);
          }
        }
      });
      resizeObserver.observe(headerElement);
    }

    // Only observe specific changes that might affect layout
    const mutationObserver = new MutationObserver(debouncedUpdate);

    if (headerElement) {
      mutationObserver.observe(headerElement, {
        childList: true, // Only direct children changes
        subtree: false, // Don't observe deep changes
        attributes: true,
        attributeFilter: ['style'], // Only style changes
      });
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver?.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  const hasHeading = useMemo(() => {
    return Boolean(heading);
  }, [heading]);

  const onCollapse = (value: boolean): void => {
    setCollapsed(value);
  };

  const renderPageControls = (): ReactNode => {
    return isDefined(headerControls)
      ? (
        <span style={{ minWidth: 'fit-content', margin: '0', marginRight: '1%' }}>
          <NodeOrFuncRenderer>{headerControls}</NodeOrFuncRenderer>
        </span>
      )
      : undefined;
  };

  // If there's a title but there's no heading, render a Simple heading component
  const renderPageTitle = (): ReactNode => {
    if (hasHeading) {
      return typeof heading === 'function' ? heading() : heading;
    }

    if (!isNullOrWhiteSpace(title) && showHeading) {
      return <LayoutHeading title={title} />;
    }

    return <Fragment />;
  };

  return (
    <Layout style={style}>
      <Sider
        className={styles.mainSider}
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        trigger={<MenuTrigger collapsed={collapsed} />}
        {...(sideMenuTheme ? { theme: sideMenuTheme } : {})}
      >
        <ConfigurableSidebarMenu
          theme={sideMenuTheme}
          name={SIDEBAR_MENU_NAME}
          isApplicationSpecific={true}
        />
      </Sider>

      <Layout className={styles.layout}>
        <Header className={styles.antLayoutHeader} style={{ background: '#ffffff', height: 'inherit' }}>
          <LayoutHeader collapsed={collapsed} headerFormId={headerFormId} />
        </Header>
        <Content className={classNames(styles.content, { collapsed })} style={contentStyle}>
          <NodeOrFuncRenderer>
            <NodeOrFuncRenderer>{breadcrumb}</NodeOrFuncRenderer>
            <div>
              {renderPageTitle()} {renderPageControls()}
            </div>

            <div
              className={classNames(styles.mainArea, styles.shaSiteLayoutBackground)}
              style={{ ...layoutBackgroundStyle, background: themeFromStorage.layoutBackground }}
            >
              {children}
            </div>
          </NodeOrFuncRenderer>
        </Content>

        {footerFormId && (
          <Footer style={footerStyle}>
            <ConfigurableForm mode="edit" formId={footerFormId} />
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
export const getLayout = (page: ReactElement): React.JSX.Element => {
  return (
    <MainLayout>
      <>{page}</>
    </MainLayout>
  );
};

export default MainLayout;
