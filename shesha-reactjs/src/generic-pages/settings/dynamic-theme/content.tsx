import { Col, Row, Alert, Typography } from 'antd';
import React, { FC } from 'react';
import { CollapsiblePanel, SectionSeparator } from '@/components';
import AlertsExample from './alertsExamples';
import FormExample from './form';
import ThemeParameters from './parameters';
import TextsExample from './textsExample';
import { useStyles } from './styles/styles';
import { IConfigurableTheme } from '@/index';

export interface IConfigurableThemePageProps {
  value?: IConfigurableTheme;
  onChange?: (theme: IConfigurableTheme) => void;
  readonly?: boolean;
}

export const ConfigurableThemeContent: FC<IConfigurableThemePageProps> = ({ value, onChange, readonly }) => {
  const { styles } = useStyles();

  return (
    <Row gutter={16}>
      <Col xs={24} sm={24} md={8} lg={6} xl={6} xxl={6}>
        <CollapsiblePanel
          collapsible="disabled"
          header={
            <Typography.Text type="secondary" className={styles.themeHeader}>
              Theme Parameters
            </Typography.Text>
          }
          className={styles.themeParameters}
        >
          <Alert type="info" message="You can modify the values by selecting the colour block" showIcon />
          <ThemeParameters value={value} onChange={onChange} readonly={readonly} />
        </CollapsiblePanel>
      </Col>

      <Col xs={24} sm={24} md={16} lg={18} xl={18} xxl={18}>
        <CollapsiblePanel
          className={styles.themeParameters}
          header={
            <Typography.Text type="secondary" className={styles.themeHeader}>
              Results
            </Typography.Text>
          }
        >
          <SectionSeparator title="Alerts" />
          <AlertsExample />

          <SectionSeparator title="Forms" containerStyle={{ marginTop: '8px' }} />
          <FormExample />

          <SectionSeparator title="Texts" containerStyle={{ marginTop: '8px' }} />
          <TextsExample />
        </CollapsiblePanel>
      </Col>
    </Row>
  );
};
