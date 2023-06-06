import {
  ConfigurableComponent,
  ISidebarMenuItem,
  SIDEBAR_MENU_NAME,
} from "@shesha/reactjs";
import { Divider, Image, ImageProps, Layout, Space } from "antd";
import { FC, PropsWithChildren, useEffect } from "react";
import ShaMenuItem from "../unAuthedAccountPageLayout/menuItem";
import ShaUserIcon from "../unAuthedAccountPageLayout/userIcon";
import { useIndexedDB } from "./hook";
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
  const { getAll } = useIndexedDB<ISidebarMenuItem[]>({
    defaultValue: [],
    dbName: "components",
    recordName: SIDEBAR_MENU_NAME,
    storeName: "keyvaluepairs",
  });

  useEffect(getAll, []);

  return (
    <MainLayoutStyle className={className}>
      <Header>
        <Image
          className="sha-login-layout-logo-icon"
          preview={false}
          {...imageProps}
        />
        <ConfigurableComponent<ISideBarMenuProps>
          name={SIDEBAR_MENU_NAME}
          isApplicationSpecific={true}
        >
          {(componentState) => (
            <Space
              className="sha-login-space"
              split={<Divider type="vertical" />}
            >
              <ShaMenuItem items={componentState?.settings?.items} />

              <ShaUserIcon username={username} />
            </Space>
          )}
        </ConfigurableComponent>
      </Header>

      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </MainLayoutStyle>
  );
};

export default PortalLayout;
