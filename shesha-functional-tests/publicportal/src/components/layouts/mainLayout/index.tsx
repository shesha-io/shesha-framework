import {
  ConfigurableApplicationComponent,
  ISidebarMenuItem,
  SIDEBAR_MENU_NAME,
} from "@shesha/reactjs";
import { Divider, Image, ImageProps, Layout, Space } from "antd";
import { FC, PropsWithChildren } from "react";
import ShaMenuItem from "../unAuthedAccountPageLayout/menuItem";
import ShaUserIcon from "../unAuthedAccountPageLayout/userIcon";
import { MainLayoutStyle } from "./styles";

const { Header, Footer, Content } = Layout;

export interface ISideBarMenuProps {
  items: ISidebarMenuItem[];
}

interface IProps extends PropsWithChildren {
  className?: string;
  imageProps: ImageProps;
  username: string;
}

const PortalLayout: FC<IProps> = ({
  children,
  className,
  imageProps,
  username,
}) => {
  return (
    <MainLayoutStyle className={className}>
      <Header>
        <Image
          className="sha-login-layout-logo-icon"
          preview={false}
          {...imageProps}
        />
        <ConfigurableApplicationComponent<ISideBarMenuProps>
          name={SIDEBAR_MENU_NAME}
          isApplicationSpecific={true}
          defaultSettings={{ items: [] }}
        >
          {(componentState) => {
            console.log('LOG: render', componentState?.settings?.items);
            return (
              <Space
                className="sha-login-space"
                split={<Divider type="vertical" />}
              >
                <ShaMenuItem items={componentState?.settings?.items} />
  
                <ShaUserIcon username={username} />
              </Space>
            );
          }}
        </ConfigurableApplicationComponent>
      </Header>

      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </MainLayoutStyle>
  );
};

export default PortalLayout;
