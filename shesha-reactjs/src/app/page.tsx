"use client";

import { Alert, Card, Col, Row } from 'antd';
import data from 'public/meta.json';
import React, { FC } from 'react';
import { useLayoutSelection } from '@/hooks';
import { LAYOUT_MODE } from '@/components/mainLayout/constant';
import CollapsiblePanel from '@/components/panel';

/**
 * There was an error
 * TS4023: Exported variable 'xxx' has or is using name 'zzz' from external module "yyy" but cannot be named.
 *
 * found a solution
 * https://stackoverflow.com/questions/43900035/ts4023-exported-variable-x-has-or-is-using-name-y-from-external-module-but
 *
 */

const Home: FC = () => {
  const { LayoutComponent } = useLayoutSelection(LAYOUT_MODE);

  return (
    <LayoutComponent>
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
    </LayoutComponent>
  );
};

export default Home;
