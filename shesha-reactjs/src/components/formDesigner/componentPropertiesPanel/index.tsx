import React, { FC } from 'react';
import { Empty } from 'antd';
import { useFormDesigner, useFormDesignerReadOnly, useFormDesignerSelectedComponentId } from '@/providers/formDesigner';

const ComponentPropertiesPanelInner: FC = () => {
  const { settingsPanelRef } = useFormDesigner();
  const readOnly = useFormDesignerReadOnly();
  const selectedComponentId = useFormDesignerSelectedComponentId();

  return (
    <>
      {!selectedComponentId && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'}
        />
      )}
      <div style={{ paddingBottom: '50px' }} ref={settingsPanelRef}></div>
    </>
  );
};

export const ComponentPropertiesPanel = React.memo(ComponentPropertiesPanelInner);
