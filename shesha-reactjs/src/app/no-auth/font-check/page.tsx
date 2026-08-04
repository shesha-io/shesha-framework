'use client';

import React from 'react';
import { Button, Typography, Menu, Input } from 'antd';

const { Title, Text } = Typography;

const FontCheckPage: React.FC = () => (
  <div style={{ padding: 40 }}>
    <Title level={1}>Heading text Aa Gg 0123</Title>
    <Text>Body label text Aa Gg 0123</Text>
    <div style={{ marginTop: 16 }}>
      <Button type="primary">Primary Button</Button>
    </div>
    <div style={{ marginTop: 16, maxWidth: 300 }}>
      <Input placeholder="Input placeholder text" />
    </div>
    <Menu
      style={{ marginTop: 16 }}
      mode="horizontal"
      items={[
        { key: '1', label: 'Menu Item One' },
        { key: '2', label: 'Menu Item Two' },
      ]}
    />
  </div>
);

export default FontCheckPage;
