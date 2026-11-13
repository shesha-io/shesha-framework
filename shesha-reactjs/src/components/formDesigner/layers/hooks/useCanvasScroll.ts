import { useCallback, useEffect, useRef } from 'react';
import { useFormDesigner } from '@/providers/formDesigner';
import { scrollCanvasToComponent } from '../canvasBridge';

/** Scrolls the canvas to a component once it's drawn (after a reveal, the tab may need a render first) */
export const useCanvasScroll = (): ((componentId: string) => void) => {
  const designer = useFormDesigner();
  const pending = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const pendingRef = pending;
    return () => pendingRef.current?.();
  }, []);

  return useCallback((componentId: string) => {
    pending.current?.();
    pending.current = undefined;
    const scroll = (): void => {
      window.setTimeout(() => scrollCanvasToComponent(componentId), 0);
    };
    if (designer.isComponentMounted(componentId)) {
      scroll();
      return;
    }
    const unsubscribe = designer.subscribe('mounted', () => {
      if (!designer.isComponentMounted(componentId))
        return;
      unsubscribe();
      pending.current = undefined;
      scroll();
    });
    pending.current = unsubscribe;
  }, [designer]);
};
