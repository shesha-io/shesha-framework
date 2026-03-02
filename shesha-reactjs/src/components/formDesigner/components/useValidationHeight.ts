import { useLayoutEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to measure the height of validation messages (.ant-form-item-explain)
 * Uses ResizeObserver and MutationObserver to track dynamic height changes
 * Ensures measurements happen after layout is complete using requestAnimationFrame
 *
 * @param zoomScale - Optional zoom scale factor (e.g., 0.5 for 50%, 1 for 100%, 2 for 200%)
 * @returns [containerRef, validationHeight] - Attach containerRef to the parent element
 */
export const useValidationHeight = (zoomScale: number = 1): [React.RefObject<HTMLDivElement | null>, number] => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [validationHeight, setValidationHeight] = useState(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastHeightRef = useRef<number>(0);
  const observedExplainElementRef = useRef<HTMLElement | null>(null);

  // Stable callback for measuring height - uses ref to avoid recreating observers
  const measureHeight = useCallback((): void => {
    const currentContainer = containerRef.current;

    if (!currentContainer) {
      if (lastHeightRef.current !== 0) {
        lastHeightRef.current = 0;
        setValidationHeight(0);
      }
      return;
    }

    // Cancel any pending RAF to prevent queue buildup
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      // Double-check container still exists after RAF
      const container = containerRef.current;
      if (!container) {
        if (lastHeightRef.current !== 0) {
          lastHeightRef.current = 0;
          setValidationHeight(0);
        }
        return;
      }

      const explainElement = container.querySelector('.ant-form-item-explain') as HTMLElement | null;

      if (explainElement) {
        // Only disconnect and re-observe if the element has changed
        if (resizeObserverRef.current && explainElement !== observedExplainElementRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current.observe(explainElement);
          observedExplainElementRef.current = explainElement;
        }

        const scaledHeight = explainElement.getBoundingClientRect().height;
        const height = scaledHeight / zoomScale;

        if (lastHeightRef.current !== height) {
          lastHeightRef.current = height;
          setValidationHeight(height);
        }
      } else {
        // Clear the observed element ref when no explain element exists
        if (observedExplainElementRef.current !== null) {
          observedExplainElementRef.current = null;
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
          }
        }
        if (lastHeightRef.current !== 0) {
          lastHeightRef.current = 0;
          setValidationHeight(0);
        }
      }
    });
  }, [zoomScale]);

  // Use useLayoutEffect to measure before paint and avoid visual flicker
  useLayoutEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      setValidationHeight(0);
      return undefined;
    }

    // Create ResizeObserver once and reuse
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        measureHeight();
      });
    }

    // Create MutationObserver once
    if (!mutationObserverRef.current) {
      // Use a micro-task to batch mutation callbacks
      let pendingMutations = false;
      mutationObserverRef.current = new MutationObserver(() => {
        if (!pendingMutations) {
          pendingMutations = true;
          queueMicrotask(() => {
            pendingMutations = false;
            measureHeight();
          });
        }
      });
    }

    // Start observing mutations
    // Only observe childList and subtree - characterData is too expensive
    mutationObserverRef.current.observe(containerElement, {
      childList: true,
      subtree: true,
    });

    // Initial measurement
    measureHeight();

    return () => {
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
        mutationObserverRef.current = null;
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      observedExplainElementRef.current = null;
    };
  }, [zoomScale, measureHeight]);

  return [containerRef, validationHeight];
};
