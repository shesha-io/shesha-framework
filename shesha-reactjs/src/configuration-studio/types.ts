// Check if value is not null or undefined
export const isDefined = <T>(value: T | null | undefined): value is NonNullable<T> => {
  return value !== null && value !== undefined;
};

export const isNullOrWhiteSpace = (value: string | null | undefined): value is null | undefined => {
  return value == null || value.trim() === '';
};

export const isNotNullOrWhiteSpace = (value: string | null | undefined): value is string => {
  return !isNullOrWhiteSpace(value);
};
