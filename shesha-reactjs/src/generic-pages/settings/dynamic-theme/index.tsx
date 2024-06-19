import { Col, Divider, Row, Alert, Typography } from 'antd';
import React, { FC } from 'react';
import { CollapsiblePanel, Page, SectionSeparator } from '@/components';
import AlertsExample from './alertsExamples';
import FormExample from './form';
import ThemeParameters from './parameters';
import TextsExample from './textsExample';

export interface IConfigurableThemePageProps { }

export const ConfigurableThemePage: FC<IConfigurableThemePageProps> = () => {
  return (
    <Page title="Customize theme">
      <Row gutter={16}>
        <Col xs={24} sm={24} md={8} lg={6} xl={6} xxl={6}>
          <CollapsiblePanel collapsible="disabled"
            header={
              <Typography.Text type='secondary' style={{ fontSize: 18, fontWeight: 700 }}>Theme Parameters</Typography.Text>
            }
            style={{ height: 'calc(100vh - 120px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
            <Alert type="info" message="You can modify the values by selecting the colour block" showIcon />
            <ThemeParameters />
          </CollapsiblePanel>
        </Col>

        <Col xs={24} sm={24} md={16} lg={18} xl={18} xxl={18}>
          <CollapsiblePanel
            style={{ height: 'calc(100vh - 120px)', overflowY: 'auto', scrollbarWidth: 'none' }}
            header={
              <Typography.Text type='secondary' style={{ fontSize: 18, fontWeight: 700 }}>Results</Typography.Text>
            }
          >
            <SectionSeparator title="Alerts" />
            <AlertsExample />

            <Divider />

            <SectionSeparator title="Forms" />
            <FormExample />

            <Divider />

            <SectionSeparator title="Texts" />
            <TextsExample />
          </CollapsiblePanel>
        </Col>
      </Row>
    </Page>
  );
};