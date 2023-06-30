import React, { FC } from 'react';
import { Col, Divider, Row } from 'antd';
import { CollapsiblePanel, Page, SectionSeparator } from '../../../components';
import FormExample from './form';
import AlertsExample from './alertsExamples';
import ThemeParameters from './parameters';
import TextsExample from './textsExample';

export interface IConfigurableThemePageProps {}

const ConfigurableThemePage: FC<IConfigurableThemePageProps> = () => {
  return (
    <Page title="Customize theme">
      <Row gutter={16}>
        <Col xs={24} sm={24} md={8} lg={6} xl={6} xxl={6}>
          <CollapsiblePanel collapsible="disabled" header="Parameters">
            <ThemeParameters />
          </CollapsiblePanel>
        </Col>

        <Col xs={24} sm={24} md={16} lg={18} xl={18} xxl={18}>
          <CollapsiblePanel header="Results">
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

export default ConfigurableThemePage;
