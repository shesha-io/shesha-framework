import { isDefined } from '@/utils/nullables';
import { useEffect, useRef, useState } from 'react';

export type ElementSize<T extends HTMLElement = HTMLDivElement> = {
  ref: React.RefObject<T | null>;
  width: number;
  height: number;
};

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


export const useElementSize = <T extends HTMLElement = HTMLDivElement>(): ElementSize<T> => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const ref = useElementSizeTracking<T>((entry) => {
    const { width, height } = entry.contentRect;
    setWidth(width);
    setHeight(height);
  });

  return { ref, width, height };
};
