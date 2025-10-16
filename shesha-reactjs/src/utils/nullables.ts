
export const isDefined = <T>(value: T | null | undefined): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

/**
 * Checks if the given string is null or white space.
 * @returns True if the string is null or white space, false otherwise.
 */
export const isNullOrWhiteSpace = (value: string | null | undefined): value is null | undefined => {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
};

/**
 * Checks if the given string is not null or white space.
 * @param value - The string to check.
 * @returns True if the string is not null or white space, false otherwise.
 */
export const isNotNullOrWhiteSpace = (value: string | null | undefined): value is string => {
  return !isNullOrWhiteSpace(value);
};
