import { useFormDesignerFormMode } from '@/providers/formDesigner';
import { FC } from 'react';
import { useStyles } from '../styles/styles';
import { MainArea } from './mainArea';
import { withToolbox } from './withToolbox';
import { withPropertiesPanel } from './withPropertiesPanel';

/*
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentPropertiesTitle } from '../componentPropertiesTitle';
export const rightSidebarProps = {
  title: () => <ComponentPropertiesTitle />,
  content: () => <ComponentPropertiesPanel />,
  placeholder: 'Properties',
};
*/
const CanvasWithPanels = withToolbox(withPropertiesPanel(MainArea));

export const DesignerMainArea: FC = () => {
  const formMode = useFormDesignerFormMode();

  const { styles } = useStyles();

  return (
    <div
      className={styles.mainArea}
      style={{
        borderTop: '1px solid #d3d3d3',
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
