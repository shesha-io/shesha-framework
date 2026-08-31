import { SplitLayout } from '@/components/splitLayout';
import { ComponentType, JSX } from 'react';
import Toolbox from '../toolbox';
import { useFormDesignerFormMode, useFormDesignerReadOnly } from '@/providers/formDesigner';
import { useStyles } from './styles';


export const withToolbox = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
): React.FC<P> => {
  return function WithToolbox(props: P) {
    const { styles } = useStyles();
    const readOnly = useFormDesignerReadOnly();
    const formMode = useFormDesignerFormMode();
    const defaultPanelSize = typeof window !== 'undefined' ? (15 / 100) * window.innerWidth : 350;

    if (formMode !== 'designer' || readOnly) {
      return <WrappedComponent {...props} />;
    }

    return (
      <SplitLayout
        panel={<Toolbox />}
        panelTitle="Builder Components"
        panelClassName={styles.scrollable}
        defaultPanelSize={defaultPanelSize}
      >
        <WrappedComponent {...props} />
      </SplitLayout>
    );
  };
};
