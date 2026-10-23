import { isDefined } from '@/utils/nullables';
import { useEffect, useRef } from 'react';

export type OnResize = (entry: ResizeObserverEntry) => void;

export const useElementSizeTracking = <T extends HTMLElement = HTMLDivElement>(onResize: OnResize): React.RefObject<T | null> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    // Get the DOM node from the ref
    const element = ref.current;
    if (!element) return;

    // Create the observer
    const resizeObserver = new ResizeObserver((entries) => {
      // Read the content box size (excludes padding/border if you want,
      // but contentRect is the standard safe choice)
      const entry = entries.at(0);
      if (!isDefined(entry))
        return;

      onResize(entry);
    });

    // Start observing
    resizeObserver.observe(element);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, [onResize]); // Empty dependency array: runs once on mount

  return ref;
};
