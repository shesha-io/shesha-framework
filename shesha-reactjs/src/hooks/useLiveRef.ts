import { useEffect, useRef } from "react";

/**
 * Returns a ref object whose `.current` property always reflects the latest
 * passed `value`. The ref itself is stable (does not change across renders).
 *
 * @param value - The value you want to keep "fresh" in a ref.
 * @returns A mutable ref object.
 */
export function useLiveRef<T>(value: T): React.RefObject<T> {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
