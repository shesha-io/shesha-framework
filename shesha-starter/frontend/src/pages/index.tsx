import { Alert, Card, Col, Row } from 'antd';
import data from 'public/meta.json';
import React from 'react';
import { CollapsiblePanel, MainLayout } from '@shesha/reactjs';
import styled from 'styled-components';

const StyledAlert = styled(Alert)`
  margin-bottom: 15px;
`;

const Home: React.FC = () => {
  return (
    <MainLayout title="Dashboard">
      <CollapsiblePanel header="Plugins">
        <StyledAlert message="This is a list of plugins the boilerplate uses" type="info" />

        <Row style={{ flex: 1 }}>
          {(data?.plugins ?? []).map((plugin) => (
            <Col md={6} key={plugin.name} data-testid="container">
              <Card title={plugin.name}>{plugin.description}</Card>
            </Col>
          ))}
        </Row>
      </CollapsiblePanel>
    </MainLayout>
  );
};

export default Home;
