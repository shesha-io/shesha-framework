import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Hook to measure the height of validation messages (.ant-form-item-explain)
 * Uses ResizeObserver and MutationObserver to track dynamic height changes
 * Ensures measurements happen after layout is complete using requestAnimationFrame
 *
 * @param zoomScale - Optional zoom scale factor (e.g., 0.5 for 50%, 1 for 100%, 2 for 200%)
 * @returns [containerRef, validationHeight] - Attach containerRef to the parent element
 */
export const useValidationHeight = (zoomScale: number = 1): [React.RefObject<HTMLDivElement>, number] => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [validationHeight, setValidationHeight] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      setValidationHeight(0);
      return () => {};
    }

    const clearRaf = (): void => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };

    const scheduleMeasureHeight = (): void => {
      clearRaf();

      rafIdRef.current = requestAnimationFrame(() => {
        const currentContainer = containerRef.current;
        if (!currentContainer) {
          setValidationHeight((prevHeight) => (prevHeight !== 0 ? 0 : prevHeight));
          return;
        }

        const explainElement = currentContainer.querySelector(".ant-form-item-explain") as HTMLElement | null;

        if (explainElement) {
          const scaledHeight = explainElement.getBoundingClientRect().height;
          const height = scaledHeight / zoomScale;
          setValidationHeight((prevHeight) => (prevHeight !== height ? height : prevHeight));
        } else {
          setValidationHeight((prevHeight) => (prevHeight !== 0 ? 0 : prevHeight));
        }
      });
    };

    const measureHeight = (): void => {
      const currentContainer = containerRef.current;

      if (!currentContainer) {
        setValidationHeight((prevHeight) => (prevHeight !== 0 ? 0 : prevHeight));
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
        clearRaf();
        return;
      }

      if (!resizeObserverRef.current) {
        resizeObserverRef.current = new ResizeObserver(() => {
          // When ResizeObserver fires, schedule measurement after layout.
          scheduleMeasureHeight();
        });
      }
// Disconnect before re-observing to prevent stale observations
      resizeObserverRef.current.disconnect();
      const explainElement = currentContainer.querySelector(".ant-form-item-explain") as HTMLElement | null;

      if (explainElement) {
        resizeObserverRef.current.observe(explainElement);
      } else if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      // Ensure measurement happens after layout is complete.
      scheduleMeasureHeight();
    };

    // Initial measurement
    measureHeight();

    // Use MutationObserver to detect when validation element is added/removed/changed
    const mutationObserver = new MutationObserver(() => {
      measureHeight();
    });
    mutationObserver.observe(containerElement, {
      childList: true,
      subtree: true,
      characterData: true, // Also watch for text changes within validation messages
    });

    return () => {
      mutationObserver.disconnect();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      clearRaf();
    };
  }, [zoomScale]); // Re-measure when zoom scale changes

  return [containerRef, validationHeight];
};
