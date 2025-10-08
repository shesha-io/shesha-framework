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

export const getStyleValue = (type: keyof IValue, direction: keyof IInputDirection, value: string): number => {
  const v = jsonSafeParse(value || '{}') as IValue;
  return (v || {})[`${type}${capitalizeFirstLetter(direction)}`] || 0;
};
