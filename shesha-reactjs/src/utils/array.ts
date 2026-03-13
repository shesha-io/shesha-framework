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

export const isNonEmptyArray = <T>(value: Array<T> | null | undefined): value is NonEmptyArray<T> => {
  return value !== null && value !== undefined && value.length > 0;
};
