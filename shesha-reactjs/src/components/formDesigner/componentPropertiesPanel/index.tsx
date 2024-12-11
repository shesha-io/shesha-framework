import React, { FC } from 'react';
import { Empty } from 'antd';
import { useFormDesignerState } from '@/providers/formDesigner';

export interface IProps { }

const ComponentPropertiesPanelInner: FC<IProps> = () => {
  const { selectedComponentId, readOnly, settingsPanelRef } = useFormDesignerState();

  return (
    <>
      {!selectedComponentId && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'
          }
        />
      )}
      <div style={{paddingBottom: '50px'}} ref={settingsPanelRef}></div>
    </>
  );
};

export const ComponentPropertiesPanel = React.memo(ComponentPropertiesPanelInner);