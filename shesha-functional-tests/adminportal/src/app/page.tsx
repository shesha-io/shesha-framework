"use client";

import { Alert, Card, Col, Row } from 'antd';
import data from 'public/meta.json';
import { PageWithLayout, CollapsiblePanel, MainLayout } from '@shesha-io/reactjs';

const Home: PageWithLayout<{}> = () => {
  return (
    <MainLayout noPadding>
      <CollapsiblePanel header="Plugins">
        <Alert title="This is a list of plugins the boilerplate uses" type="info" style={{ marginBottom: "15px" }} />

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