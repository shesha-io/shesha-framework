import { MutableRefObject } from "react";

export interface ManualMutableRefObject<T> extends MutableRefObject<T> {
  current: T;
}

export const createManualRef = <T>(initialValue: T): ManualMutableRefObject<T> => {
  return { current: initialValue };
};
