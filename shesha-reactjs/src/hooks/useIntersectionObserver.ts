import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions {
  /**
   * Threshold at which to trigger the callback (0-1, where 1 means 100% visible)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Margin around the root to expand or shrink the intersection area
   * Positive values load content before it's visible (e.g., '100px')
   * @default '100px'
   */
  rootMargin?: string;
  /**
   * Whether intersection observer is enabled
   * @default true
   */
  enabled?: boolean;
}

export interface UseIntersectionObserverReturn {
  /**
   * Ref to attach to the element to observe
   */
  elementRef: React.RefObject<HTMLElement>;
  /**
   * Whether the element is currently visible in the viewport
   */
  isVisible: boolean;
  /**
   * Whether the element has ever been visible (doesn't reset to false)
   */
  hasBeenVisible: boolean;
}

/**
 * Hook to detect when an element enters the viewport using Intersection Observer API
 * Useful for lazy loading content in tables or infinite scroll scenarios
 *
 * @example
 * ```tsx
 * const { elementRef, hasBeenVisible } = useIntersectionObserver({
 *   threshold: 0.1,
 *   rootMargin: '150px'
 * });
 *
 * return (
 *   <div ref={elementRef}>
 *     {hasBeenVisible ? <ExpensiveComponent /> : <Skeleton />}
 *   </div>
 * );
 * ```
 */
export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn => {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // If disabled, immediately mark as visible
    if (!enabled) {
      setIsVisible(true);
      setHasBeenVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);

        // Once visible, always mark as "has been visible"
        if (visible && !hasBeenVisible) {
          setHasBeenVisible(true);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, enabled, hasBeenVisible]);

  return { elementRef, isVisible, hasBeenVisible };
};
