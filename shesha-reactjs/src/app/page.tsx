"use client";

import { Alert, Card, Col, Row } from 'antd';
import data from 'public/meta.json';
import React from 'react';
import { CollapsiblePanel } from '@/components';
import styled from 'styled-components';
import { PageWithLayout } from '@/interfaces';

const StyledAlert = styled(Alert)`
  margin-bottom: 15px;
`;

const Home: PageWithLayout<{}> = () => {
  return (
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
  );
};

export default Home;