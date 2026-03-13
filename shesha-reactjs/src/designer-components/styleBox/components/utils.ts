import { capitalizeFirstLetter } from '@/utils/string';
import { IInputDirection, IValue } from '../interfaces';
import { jsonSafeParse } from '@/utils/object';

export const getStyleChangeValue = (
  type: keyof IValue,
  direction: keyof IInputDirection,
  value: string,
  prevVal: string,
): string => {
  const v = jsonSafeParse<object>(prevVal || '{}');

  return JSON.stringify({
    ...(v || {}),
    [`${type}${capitalizeFirstLetter(direction)}`]: value.replace(/\b0+/g, ''),
  });
};

export const getStyleValue = (type: keyof IValue, direction: keyof IInputDirection, value: string): string => {
  const parsed = jsonSafeParse(value || '{}');

  // Compute the dynamic key (e.g., "paddingTop", "marginLeft")
  const key = `${type}${capitalizeFirstLetter(direction)}`;

  // Runtime checks: ensure parsed is an object, property exists, and value is a string
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const propValue = (parsed as Record<string, unknown>)[key];
    if (typeof propValue === 'string') {
      return propValue;
    }
  }

  return '0';
};
