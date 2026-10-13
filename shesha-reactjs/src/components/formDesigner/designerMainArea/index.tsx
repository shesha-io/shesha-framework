import { useFormDesignerFormMode } from '@/providers/formDesigner';
import { FC } from 'react';
import { useDesignerClipboardEvents } from '../clipboard/useDesignerClipboardEvents';
import { useStyles } from '../styles/styles';
import { MainArea } from './mainArea';
import { withToolbox } from './withToolbox';
import { withPropertiesPanel } from './withPropertiesPanel';
import { withValidationPanel } from './withValidationPanel';

const CanvasWithPanels = withToolbox(withPropertiesPanel(withValidationPanel(MainArea)));

export const DesignerMainArea: FC = () => {
  const formMode = useFormDesignerFormMode();
  const clipboardEvents = useDesignerClipboardEvents();

  const { styles } = useStyles();

  return (
    <div
      className={styles.mainArea}
      // focusable, so copy and paste reach this designer after a click on its canvas
      tabIndex={-1}
      {...(formMode === 'designer' ? clipboardEvents : {})}
      style={{
        borderTop: '1px solid #d3d3d3',
        outline: 'none',
        ...(formMode !== 'designer' && {
          maxHeight: '85vh',
          overflow: 'auto',
        }),
      }}
    >
      <CanvasWithPanels />
    </div>
  );
};
