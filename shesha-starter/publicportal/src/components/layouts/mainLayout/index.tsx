"use client";
import {
  ConfigurableApplicationComponent,
  CustomErrorBoundary,
  ISidebarMenuItem,
  SIDEBAR_MENU_NAME,
  SidebarMenuProvider,
} from "@shesha-io/reactjs";
import { Divider, Image, ImageProps, Layout, Space } from "antd";
import classNames from "classnames";
import { FC, PropsWithChildren } from "react";
import { LayoutMenu } from "../unAuthedAccountPageLayout/menu/index";
import ShaUserIcon from "../unAuthedAccountPageLayout/userIcon";
import { useStyles } from "./styles";

const { Header, Footer, Content } = Layout;

export interface ISideBarMenuProps {
  items: ISidebarMenuItem[];
}

interface IProps extends PropsWithChildren {
  className?: string;
  imageProps: ImageProps;
}

const PortalLayout: FC<IProps> = ({ children, className, imageProps }) => {
  const { styles } = useStyles();

  return (
    <Layout className={classNames(styles.shaMainLayout, className)}>
      <Header>
        <Image
          className="sha-login-layout-logo-icon"
          preview={false}
          {...imageProps}
        />
        <CustomErrorBoundary>
          <ConfigurableApplicationComponent<ISideBarMenuProps>
            name={SIDEBAR_MENU_NAME}
            isApplicationSpecific={true}
            defaultSettings={{ items: [] }}
          >
            {(componentState) => (
              <Space
                className="sha-login-space"
                split={<Divider type="vertical" />}
              >
                <SidebarMenuProvider
                  items={componentState.settings?.items || []}
                >
                  <LayoutMenu />
                </SidebarMenuProvider>

                <ShaUserIcon />
              </Space>
            )}
          </ConfigurableApplicationComponent>
        </CustomErrorBoundary>
      </Header>

      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export default PortalLayout;
