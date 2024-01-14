import { capitalizeFirstLetter } from '@/utils/string';
import { IInputDirection, IValue } from '../interfaces';

export const getStyleChangeValue = (
  type: keyof IValue,
  direction: keyof IInputDirection,
  value: string,
  prevVal: string
) => {
  const v = JSON.parse(prevVal || '{}');

  return JSON.stringify({
    ...(v || {}),
    [`${type}${capitalizeFirstLetter(direction)}`]: value.replace(/\b0+/g, ''),
  });
};

export const getStyleClassName = (type: keyof IValue, direction: keyof IInputDirection) =>
  `${type.substring(0, 4)}-${direction}`;

export const getStyleValue = (type: keyof IValue, direction: keyof IInputDirection, value: string) => {
  const v = JSON.parse(value || '{}') as IValue;
  return (v || {})[`${type}${capitalizeFirstLetter(direction)}`] || 0;
};
