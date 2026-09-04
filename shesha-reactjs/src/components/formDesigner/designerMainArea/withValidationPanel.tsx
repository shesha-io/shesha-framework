import { ComponentType, JSX, ReactNode } from 'react';
import { SplitLayout } from '@/components/splitLayout';
import { useFormDesignerFormMode } from '@/providers/formDesigner';
import { ValidationPanel } from '../validationPanel';

export const withValidationPanel = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
): React.FC<P> => {
  return function WithPropertiesPanel(props: P): ReactNode {
    const formMode = useFormDesignerFormMode();
    const isDesigner = formMode === 'designer';
    const defaultPanelSize = typeof window !== 'undefined' ? (15 / 100) * window.innerWidth : 350;

    if (!isDesigner) {
      return <WrappedComponent {...props} />;
    }

    return (
      <SplitLayout
        orientation="vertical"
        position="end"
        panel={<ValidationPanel />}
        defaultPanelSize={defaultPanelSize}
        panelTitle="Problems"
      >
        <WrappedComponent {...props} />
      </SplitLayout>
    );
  };
};
