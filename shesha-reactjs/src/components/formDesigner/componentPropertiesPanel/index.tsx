import React, { FC, useCallback } from 'react';
import { Empty } from 'antd';
import { useFormDesigner, useFormDesignerReadOnly, useFormDesignerSelectedComponentId } from '@/providers/formDesigner';
import { useStyles } from './styles';

const ComponentPropertiesPanelInner: FC = () => {
  const { styles } = useStyles();
  const formDesigner = useFormDesigner();
  const readOnly = useFormDesignerReadOnly();
  const selectedComponentId = useFormDesignerSelectedComponentId();

  const panelRef = useCallback((node: HTMLDivElement | null) => {
    formDesigner.setSettingsPanelElement(node);
  }, [formDesigner]);

  return (
    <>
      {!selectedComponentId && (
        <div className={styles.emptyState}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={readOnly ? 'Please select a component to view settings' : 'Please select a component to begin editing'}
          />
        </div>
      )}
      <div ref={panelRef}></div>
    </>
  );
};

export const ComponentPropertiesPanel = React.memo(ComponentPropertiesPanelInner);

