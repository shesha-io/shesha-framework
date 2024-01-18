import React, { FC } from 'react';
import { BugOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useFormDesigner } from '@/providers/formDesigner';

export interface IDebugButtonProps {

}

export const DebugButton: FC<IDebugButtonProps> = () => {
  const { setDebugMode, isDebug } = useFormDesigner();

  return (
    <Button
      key="debug"
      onClick={() => {
        setDebugMode(!isDebug);
      }}
      title="Debug"
      type="primary"
      ghost={!isDebug}
      shape="circle"
    >
      <BugOutlined />
    </Button>
  );
};