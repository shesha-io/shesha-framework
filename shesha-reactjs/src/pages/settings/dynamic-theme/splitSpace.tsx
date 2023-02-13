import { Divider, Space, SpaceProps } from 'antd';
import React from 'react';

export const SplitSpace: React.FC<SpaceProps> = props => (
  <Space split={<Divider type="vertical" />} size={4} {...props} />
);
