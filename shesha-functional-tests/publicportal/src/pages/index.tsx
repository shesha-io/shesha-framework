import { CollapsiblePanel } from "@shesha/reactjs";
import { Alert, Card, Col, Row } from "antd";
import { PortalLayout } from "components";
import data from "public/meta.json";
import React from "react";
import { LOGO } from "src/app-constants/application";
import styled from "styled-components";

const StyledAlert = styled(Alert)`
  margin-bottom: 15px;
`;

const Home: React.FC = () => {
  return (
    <PortalLayout imageProps={LOGO} username="Admin">
      <CollapsiblePanel header="Plugins">
        <StyledAlert
          message="This is a list of plugins the boilerplate uses"
          type="info"
        />

        <Row style={{ flex: 1 }}>
          {(data?.plugins ?? []).map((plugin) => (
            <Col md={6} key={plugin.name} data-testid="container">
              <Card title={plugin.name}>{plugin.description}</Card>
            </Col>
          ))}
        </Row>
      </CollapsiblePanel>
    </PortalLayout>
  );
};

export default Home;
