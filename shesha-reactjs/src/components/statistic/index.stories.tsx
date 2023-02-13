import React, { ReactNode } from 'react';
import { Meta } from '@storybook/react/types-6-0';
import { Story } from '@storybook/react';
import ShaStatistic from '.';
import { CollapsiblePanel } from '..';
import { Col, Row } from 'antd';
import { nanoid } from 'nanoid/non-secure';
import { ArrowUpOutlined } from '@ant-design/icons';

export default {
  title: 'Components/Statistic',
  component: ShaStatistic,
} as Meta;

export interface IFormDesignerStoryProps {
  formPath: string;
}

const STATS: {
  title: string;
  value: number;
  precision?: number;
  prefix?: ReactNode;
}[] = [
  { title: 'First title', value: 23, prefix: <ArrowUpOutlined /> },
  { title: 'Second title', value: 453 },
  { title: 'Third title', value: 65 },
  { title: 'Fourth title', value: 92 },
  { title: 'Fifth title', value: 132 },
  { title: 'Sixth title', value: 223 },
  { title: 'Sevent title', value: 19 },
];

// Create a master template for mapping args to render the Button component
const Template: Story<IFormDesignerStoryProps> = args => (
  <CollapsiblePanel header="Statistics">
    <Row gutter={[12, 12]}>
      {STATS?.map(props => (
        <Col key={nanoid()} span={6}>
          <ShaStatistic {...props} />
        </Col>
      ))}
    </Row>
  </CollapsiblePanel>
);

export const Basic = Template.bind({});
