
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
 * Returns the given string if it is not null or white space, otherwise returns undefined.
 * @param value - The string to check.
 * @returns The given string if it is not null or white space, otherwise undefined.
 */
export const undefinedIfNullOrWhiteSpace = (value: string | null | undefined): string | undefined => {
  return isNullOrWhiteSpace(value) ? undefined : value;
};

/**
 * Checks if the given string is not null or white space.
 * @param value - The string to check.
 * @returns True if the string is not null or white space, false otherwise.
 */
export const isNotNullOrWhiteSpace = (value: string | null | undefined): value is string => {
  return !isNullOrWhiteSpace(value);
};

/**
 * Coerces an antd `ColorValueType` (string | AggregationColor | gradient | null) into a plain CSS
 * color string usable in `style` props. Returns undefined for null/gradient/unsupported values.
 * @param value - The color value to coerce.
 * @returns A CSS color string, or undefined when there is no usable single color.
 */
export const coerceCssColor = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return value;
  // AggregationColor exposes toHexString(); gradients are arrays and have no single CSS color.
  if (typeof value === 'object' && typeof (value as { toHexString?: unknown }).toHexString === 'function') {
    return (value as { toHexString: () => string }).toHexString();
  }
  return undefined;
};
