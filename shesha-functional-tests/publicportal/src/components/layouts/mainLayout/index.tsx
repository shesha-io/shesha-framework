import { Layout } from "antd";
import { FC, PropsWithChildren } from "react";

const { Header, Footer, Content } = Layout;

const PortalLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Layout>
      <Header>Header</Header>
      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export default PortalLayout;
