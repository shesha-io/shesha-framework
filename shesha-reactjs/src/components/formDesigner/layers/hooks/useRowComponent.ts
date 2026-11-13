import { useCallback, useSyncExternalStore } from 'react';
import { IConfigurableFormComponent, isConfigurableFormComponent } from '@/providers/form/models';
import { useFormDesigner } from '@/providers/formDesigner';

/**
 * The component a row shows (for pane rows, the owner). The designer replaces only an edited component's object,
 * so typing in the properties panel re-renders only that component's row.
 */
export const useRowComponent = (componentId: string): IConfigurableFormComponent | undefined => {
  const designer = useFormDesigner();
  const subscribe = useCallback((onStoreChange: () => void) => designer.subscribe('markup', onStoreChange), [designer]);
  const getSnapshot = useCallback(() => {
    const item = designer.state.formFlatMarkup.allComponents[componentId];
    return isConfigurableFormComponent(item) ? item : undefined;
  }, [designer, componentId]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
