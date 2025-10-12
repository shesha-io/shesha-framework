import React, { FC } from 'react';
import { BugOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';

export const DebugButton: FC = () => {
  const isDebug = useFormDesignerStateSelector((x) => x.isDebug);
  const { setDebugMode } = useFormDesignerActions();

  return (
    <Button
      key="debug"
      onClick={() => {
        setDebugMode(!isDebug);
      }}
      icon={<BugOutlined />}
      title="Debug"
      type="primary"
      ghost={!isDebug}
    />
  );
};
