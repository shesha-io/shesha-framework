import React, { FC } from 'react';
import { Empty } from 'antd';
import { useFormDesigner } from '@/providers/formDesigner';

export interface IProps { }

export const ComponentPropertiesPanel: FC<IProps> = () => {
  const { selectedComponentId, readOnly, settingsPanelRef } = useFormDesigner();

  return (
    <>
      <div ref={settingsPanelRef} />
      {!selectedComponentId && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'
          }
        />
      )}
    </>
  );
};