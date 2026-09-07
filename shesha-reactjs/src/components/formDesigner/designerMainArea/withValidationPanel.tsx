import { ComponentType, JSX, ReactNode } from 'react';
import { SplitLayout } from '@/components/splitLayout';
import { useFormDesignerFormMode } from '@/providers/formDesigner';
import { ValidationPanel } from '../validationPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ValidationIndicators } from './ValidationIndicators';

export const withValidationPanel = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
): React.FC<P> => {
  return function WithPropertiesPanel(props: P): ReactNode {
    const formMode = useFormDesignerFormMode();
    const isDesigner = formMode === 'designer';
    const [panelCollapsed, setPanelCollapsed] = useLocalStorage('shesha:fd-validation-collapsed', true);
    const [panelPinned, setPanelPinned] = useLocalStorage('shesha:fd-validation-pinned', false);
    const defaultPanelSize = typeof window !== 'undefined' ? (15 / 100) * window.innerWidth : 350;

    if (!isDesigner) {
      return <WrappedComponent {...props} />;
    }

    return (
      <SplitLayout
        orientation="vertical"
        position="end"
        panel={<ValidationPanel />}
        panelTitle={(expanded) => {
          return expanded
            ? "Problems"
            : <ValidationIndicators />;
        }}
        defaultPanelSize={defaultPanelSize}
        defaultExpanded={!panelCollapsed && panelPinned}
        onExpandedToggle={(expanded) => setPanelCollapsed(!expanded)}
        defaultPinned={panelPinned}
        onPinnedToggle={(pinned) => setPanelPinned(pinned)}
      >
        <WrappedComponent {...props} />
      </SplitLayout>
    );
  };
};
