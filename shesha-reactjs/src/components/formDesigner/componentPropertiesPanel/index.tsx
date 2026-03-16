import React, { FC, useCallback, useState } from 'react';
import { Empty } from 'antd';
import { useFormDesigner, useFormDesignerReadOnly, useFormDesignerSelectedComponentId } from '@/providers/formDesigner';

const ComponentPropertiesPanelInner: FC = () => {
  const { settingsPanelRef } = useFormDesigner();
  const readOnly = useFormDesignerReadOnly();
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const [, setSettingsPanelElement] = useState<HTMLDivElement | null>(null);

  // Use a callback ref to trigger a re-render when the element is mounted
  // This ensures that ConfigurableFormComponentDesigner re-creates the portal
  const settingsPanelCallbackRef = useCallback((node: HTMLDivElement | null) => {
    // Update the ref in formDesigner
    (settingsPanelRef as React.MutableRefObject<HTMLDivElement | undefined>).current = node ?? undefined;
    // Update state to trigger a re-render
    setSettingsPanelElement(node);
  }, [settingsPanelRef]);

  return (
    <>
      {!selectedComponentId && (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'}
        />
      )}
      <div ref={settingsPanelCallbackRef}></div>
    </>
  );
};

export const ComponentPropertiesPanel = React.memo(ComponentPropertiesPanelInner);
