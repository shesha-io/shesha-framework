import { useEffect, useRef } from "react";

export const useIsFirstRender = (): boolean => {
  // 1. Initialize the ref to 'true'. This happens once.
  const isFirst = useRef(true);

  // 2. Move the mutation OUT of the render phase.
  //    This effect runs AFTER the DOM has been updated (mount).
  useEffect(() => {
    isFirst.current = false; // Mutation happens here, safely.
  }, []); // Empty deps = runs only once on mount.

  // 3. Reading the ref value during render is completely fine.
  //    No warning will be thrown.
  // eslint-disable-next-line react-hooks/refs
  return isFirst.current;
};
