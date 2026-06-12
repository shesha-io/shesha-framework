import { isDefined } from "./nullables";

type RemoveUndefined<T> = {
  [K in keyof T as T[K] extends undefined ? never : K]: T[K];
};

export const removeUndefinedProperties = <T extends object>(obj: T): RemoveUndefined<T> => {
  const result = {} as T;

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }

  return result;
};

export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Checks if the given value is an array with at least one element.
 * @returns true if the value is an array with at least one element, false otherwise.
 */
export const isNonEmptyArray = <T>(value: Array<T> | null | undefined): value is NonEmptyArray<T> => {
  return isDefined(value) && value.length > 0 && isDefined(value[0]);
};

/**
 * Returns the given array if it is not empty, otherwise returns undefined.
 * @template T
 * @param value - The array to check.
 * @returns The array if it is not empty, otherwise undefined.
 */
export const undefinedIfEmptyArray = <T>(value: Array<T> | null | undefined): T[] | undefined => {
  return isNonEmptyArray(value) ? value : undefined;
};

type TenNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type ArrayWithNItems<N extends TenNumbers, T> =
  N extends 1 ? [Exclude<T, undefined>, ...T[]]
    : N extends 2 ? [Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
      : N extends 3 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
        : N extends 4 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
          : N extends 5 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
            : N extends 6 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
              : N extends 7 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
                : N extends 8 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
                  : N extends 9 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
                    : N extends 10 ? [Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, Exclude<T, undefined>, ...T[]]
                      : never;

export const arrayHasAtLeastNDefined = <T, N extends TenNumbers>(
  arr: T[],
  n: N,
): arr is ArrayWithNItems<N, T> => {
  if (arr.length < n) return false;
  for (let i = 0; i < n; i++) {
    if (arr[i] === undefined) return false;
  }
  return true;
};

export const arrayHasExactNDefined = <T, N extends TenNumbers>(
  arr: T[],
  n: N,
): arr is ArrayWithNItems<N, T> => arrayHasAtLeastNDefined(arr, n) && arr.length === n;

export const getElement = <T>(arr: T[], index: number): T => {
  if (index < 0 || index >= arr.length) {
    throw new Error(`Index ${index} out of bounds for array of length ${arr.length}`);
  }
  return arr[index]!;
};

export const findMap = <T, R>(arr: T[], fn: (item: T) => R | null | undefined): R | undefined => {
  for (const item of arr) {
    const result = fn(item);
    if (result != null) return result;
  }
  return undefined;
};
