import { RefObject } from "react";

export interface ManualRefObject<T> extends RefObject<T> {
  current: T;
}

export const createManualRef = <T>(initialValue: T): ManualRefObject<T> => {
  return { current: initialValue };
};
