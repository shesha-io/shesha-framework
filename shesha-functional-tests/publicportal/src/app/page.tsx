"use client";

import { Alert, Card, Col, Row } from 'antd';
import data from 'public/meta.json';
import React from 'react';
import { PageWithLayout, CollapsiblePanel } from '@shesha-io/reactjs';
import styled from 'styled-components';
import { PortalLayout } from 'src/components/index';
import { LOGO } from 'src/app-constants/application';

const StyledAlert = styled(Alert)`
  margin-bottom: 15px;
`;

const Home: PageWithLayout<{}> = () => {
  return (
    <PortalLayout imageProps={LOGO}>
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
    </PortalLayout>
  );
};

export default Home;