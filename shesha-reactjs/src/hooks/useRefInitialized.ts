import { MutableRefObject, useRef } from "react";

/**
 * Creates a ref that is initialized with the given function.
 * If the ref is already initialized, it is not re-initialized.
 * @template T The type of the ref.
 * @param init The function to call to initialize the ref.
 * @returns A ref that is initialized with the given function.
 */
export const useRefInitialized = <T>(init: () => T): MutableRefObject<T> => {
  const ref = useRef<T>();
  if (ref.current === undefined)
    ref.current = init();

  return ref;
};

