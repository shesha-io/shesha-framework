import { RefObject, useEffect, useState } from 'react';

const MIN_HEIGHT = 200;
const BOTTOM_GAP = 16;

/** Height left between the element's top and the bottom of the window; the virtual list needs a fixed height */
export const useAvailableHeight = (elementRef: RefObject<HTMLElement | null>): number => {
  const [height, setHeight] = useState(400);

  useEffect(() => {
    const update = (): void => {
      const element = elementRef.current;
      if (element === null)
        return;
      setHeight(Math.max(MIN_HEIGHT, Math.floor(window.innerHeight - element.getBoundingClientRect().top - BOTTOM_GAP)));
    };
    const timer = window.setTimeout(update, 0);
    window.addEventListener('resize', update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', update);
    };
  }, [elementRef]);

  return height;
};
