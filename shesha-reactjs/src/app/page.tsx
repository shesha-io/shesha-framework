"use client";

import { Alert, Card, Col, Row } from 'antd';
import data from 'public/meta.json';
import React from 'react';
import { CollapsiblePanel } from '@/components';
import styled from 'styled-components';
import { PageWithLayout } from '@/interfaces';
import { useLayoutSelection } from '@/hooks';

/**
 * There was an error
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 *
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 *
 */

const StyledAlert: any = styled(Alert)`
  margin-bottom: 15px;
`;

const Home: PageWithLayout = () => {
  const { LayoutComponent } = useLayoutSelection('defaultLayout');

  return (
    <LayoutComponent>
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
    </LayoutComponent>
  );
};

export default Home;
