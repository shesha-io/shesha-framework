import { ComponentType, JSX, ReactNode } from 'react';
import { SplitLayout } from '@/components/splitLayout';
import { useFormDesignerFormMode, useFormDesignerSelectedComponent } from '@/providers/formDesigner';
import { ComponentPropertiesPanel } from '../componentPropertiesPanel';
import { ComponentTitleButtons } from '../componentTitleButtons';
import { isDefined } from '@/utils';

export const withPropertiesPanel = <P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
): React.FC<P> => {
  return function WithPropertiesPanel(props: P): ReactNode {
    const component = useFormDesignerSelectedComponent();
    const formMode = useFormDesignerFormMode();
    const isDesigner = formMode === 'designer';
    const defaultPanelSize = typeof window !== 'undefined' ? (15 / 100) * window.innerWidth : 350;

    if (!isDesigner) {
      return <WrappedComponent {...props} />;
    }

    return (
      <SplitLayout
        orientation="horizontal"
        position="end"
        panel={<ComponentPropertiesPanel />}
        defaultPanelSize={defaultPanelSize}
        panelTitle={isDefined(component) && typeof (component.label) === 'string'
          ? component.label
          : 'Properties'}
        panelExtra={<ComponentTitleButtons />}
      >
        <WrappedComponent {...props} />
      </SplitLayout>
    );
  };
};
