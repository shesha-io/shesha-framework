// Helper type to increment the depth counter
type AddOne<N extends number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10][N];

export type PathImpl<T, Key extends keyof T, Depth extends number = 10, CurrentDepth extends number = 0> =
  CurrentDepth extends Depth
    ? Key extends string ? Key : never
    : Key extends string
      ? NonNullable<T[Key]> extends Record<string, unknown>
        ? Key | `${Key}.${PathImpl<NonNullable<T[Key]>, keyof NonNullable<T[Key]>, Depth, AddOne<CurrentDepth>>}`
        : Key
      : never;

export type Path<T> = PathImpl<T, keyof T> | keyof T | '';

export type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;

export type FieldValueGetter<TData> = <P extends Path<TData>>(path: P) => PathValue<TData, P>;
export type FieldValueSetter<TData> = <P extends Path<TData>>(path: P, value: PathValue<TData, P>) => void;

/**
 * Splits a dot notation path into two parts: the first part and the remaining part after the first dot.
 * If the path does not contain a dot, the first part is the entire path and the remaining part is an empty string.
 * @example
 * splitDotNotation('a.b.c') // returns ['a', 'b.c']
 * splitDotNotation('a') // returns ['a', '']
 * @returns An array containing two strings: the first part and the remaining part.
 */
export const splitDotNotation = (path: string): [string, string] => {
  if (!path.includes('.')) {
    return [path, ''];
  }

  const firstDotIndex = path.indexOf('.');
  const firstPart = path.substring(0, firstDotIndex);
  const remainingPart = path.substring(firstDotIndex + 1);

  return [firstPart, remainingPart];
};
