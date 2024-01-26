import {
  ConfigurableApplicationComponent,
  CustomErrorBoundary,
  ISidebarMenuItem,
  SidebarMenuProvider,
  SIDEBAR_MENU_NAME,
} from "@shesha-io/reactjs";
import { Divider, Image, ImageProps, Layout, Space } from "antd";
import React, { FC, PropsWithChildren } from "react";
import { LayoutMenu } from "../unAuthedAccountPageLayout/menu/index";
import ShaUserIcon from "../unAuthedAccountPageLayout/userIcon";
import { MainLayoutStyle } from "./styles";

const { Header, Footer, Content } = Layout;

export interface ISideBarMenuProps {
  items: ISidebarMenuItem[];
}

interface IProps extends PropsWithChildren {
  className?: string;
  imageProps: ImageProps;
}

const PortalLayout: FC<IProps> = ({
  children,
  className,
  imageProps,
}) => {
  return (
    <MainLayoutStyle className={className}>
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
                <SidebarMenuProvider items={componentState.settings?.items || []}>
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
    </MainLayoutStyle>
  );
};

export default PortalLayout;
