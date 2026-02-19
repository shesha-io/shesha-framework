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

  useLayoutEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) {
      setValidationHeight(0);
      return;
    }

    let resizeObserver: ResizeObserver | null = null;
    let rafId: number | null = null;

    const measureHeight = (): void => {
      // Use requestAnimationFrame to ensure measurement happens after layout is complete
      // This prevents stale height values when content changes rapidly (e.g., during typing)
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        // Look for the validation explain container which holds all error messages
        const explainElement = containerElement.querySelector('.ant-form-item-explain') as HTMLElement;

        if (explainElement) {
          // getBoundingClientRect returns scaled dimensions when zoomed
          // Divide by zoom scale to get the actual CSS pixel value needed
          const scaledHeight = explainElement.getBoundingClientRect().height;
          const height = scaledHeight / zoomScale;
          // Only update if height has changed to avoid unnecessary re-renders
          setValidationHeight((prevHeight) => prevHeight !== height ? height : prevHeight);

          // Set up ResizeObserver to watch for size changes
          if (!resizeObserver) {
            resizeObserver = new ResizeObserver(() => {
              // When ResizeObserver fires, also use RAF to measure after layout
              rafId = requestAnimationFrame(() => {
                const newScaledHeight = explainElement.getBoundingClientRect().height;
                const newHeight = newScaledHeight / zoomScale;
                setValidationHeight((prevHeight) => prevHeight !== newHeight ? newHeight : prevHeight);
              });
            });
            resizeObserver.observe(explainElement);
          }
        } else {
          // No validation message, remove spacing and clean up observer
          setValidationHeight((prevHeight) => prevHeight !== 0 ? 0 : prevHeight);
          if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
          }
        }
        rafId = null;
      });
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
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [zoomScale]); // Re-measure when zoom scale changes

  return [containerRef, validationHeight];
};
