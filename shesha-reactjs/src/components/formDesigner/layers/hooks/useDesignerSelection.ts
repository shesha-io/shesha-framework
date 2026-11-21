import { useCallback, useSyncExternalStore } from 'react';
import { useFormDesigner } from '@/providers/formDesigner';

/** The selected component id. Unlike useFormDesignerSelectedComponentId, re-renders only when the id itself changes */
export const useSelectedComponentId = (): string | undefined => {
  const designer = useFormDesigner();
  const subscribe = useCallback((onStoreChange: () => void) => designer.subscribe('selection', onStoreChange), [designer]);
  const getSnapshot = useCallback(() => designer.selectedComponentId, [designer]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

/** Whether this component is selected. A selection change re-renders only the two rows whose answer changed */
export const useIsSelected = (componentId: string): boolean => {
  const designer = useFormDesigner();
  const subscribe = useCallback((onStoreChange: () => void) => designer.subscribe('selection', onStoreChange), [designer]);
  const getSnapshot = useCallback(() => designer.selectedComponentId === componentId, [designer, componentId]);
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
