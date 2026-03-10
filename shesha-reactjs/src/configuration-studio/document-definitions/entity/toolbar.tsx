import React, { FC } from 'react';
import { Space } from 'antd';
import { SaveButton } from '@/components/modelConfigurator/toolbar/saveButton';

export interface IEntityToolbarProps {
  readOnly?: boolean;
}

export const EntityToolbar: FC<IEntityToolbarProps> = () => {
  return (
    <Space direction="horizontal" size={5}>
      <SaveButton size="small" type="primary" />
    </Space>
  );
};
