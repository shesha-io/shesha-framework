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
