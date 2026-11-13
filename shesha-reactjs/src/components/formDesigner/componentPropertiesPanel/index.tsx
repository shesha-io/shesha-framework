import { memo, FC, useCallback } from 'react';
import { Alert, Empty } from 'antd';
import { useFormDesigner, useFormDesignerIsSelectedMounted, useFormDesignerReadOnly, useFormDesignerSelectedComponentId } from '@/providers/formDesigner';
import { getNotOnCanvasMessage } from '@/providers/formDesigner/structure/messages';
import { isDefined } from '@/utils/nullables';
import { useStyles } from './styles';

const ComponentPropertiesPanelInner: FC = () => {
  const { styles } = useStyles();
  const formDesigner = useFormDesigner();
  const readOnly = useFormDesignerReadOnly();
  const selectedComponentId = useFormDesignerSelectedComponentId();
  const isSelectedMounted = useFormDesignerIsSelectedMounted();

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
      {isDefined(selectedComponentId) && !isSelectedMounted && (
        <div className={styles.notOnCanvas}>
          <Alert
            type="info"
            showIcon
            title={getNotOnCanvasMessage(formDesigner.state.formFlatMarkup, formDesigner.getContainerOwnership(), selectedComponentId)}
          />
        </div>
      )}
      <div ref={panelRef}></div>
    </>
  );
};

export const ComponentPropertiesPanel = memo(ComponentPropertiesPanelInner);

