import { Layout } from "antd";
import { FC } from "react";

const { Header, Footer, Content } = Layout;

const PortalLayout: FC = ({ children }) => {
  return (
    <Layout>
      <Header>Header</Header>
      <Content>{children}</Content>
      <Footer>Footer</Footer>
    </Layout>
  );
};

export default PortalLayout;
