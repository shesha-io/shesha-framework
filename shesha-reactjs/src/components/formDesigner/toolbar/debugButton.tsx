import React, { FC } from 'react';
import { BugOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useFormDesigner, useFormDesignerIsDebug } from '@/providers/formDesigner';

export const DebugButton: FC = () => {
  const isDebug = useFormDesignerIsDebug();
  const { setDebugMode } = useFormDesigner();

  return (
    <Button
      key="debug"
      onClick={() => {
        setDebugMode(!isDebug);
      }}
      icon={<BugOutlined />}
      title="Debug"
      type="primary"
      size="small"
      ghost={!isDebug}
    />
  );
};
