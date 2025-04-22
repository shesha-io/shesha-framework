import React, { FC } from 'react';
import { BugOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useFormDesignerActions, useFormDesignerStateSelector } from '@/providers/formDesigner';

export interface IDebugButtonProps {

}

export const DebugButton: FC<IDebugButtonProps> = () => {
  const isDebug = useFormDesignerStateSelector(x => x.isDebug);
  const { setDebugMode } = useFormDesignerActions();  

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