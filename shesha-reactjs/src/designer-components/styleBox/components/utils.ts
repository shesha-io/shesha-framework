import { capitalizeFirstLetter } from '@/utils/string';
import { IInputDirection, IValue } from '../interfaces';
import { jsonSafeParse } from '@/utils/object';
import { addPx } from '@/utils/style';

export const getStyleChangeValue = (
  type: keyof IValue,
  direction: keyof IInputDirection,
  value: string,
  prevVal: string,
) => {
  const v = jsonSafeParse(prevVal || '{}');

  return JSON.stringify({
    ...(v || {}),
    [`${type}${capitalizeFirstLetter(direction)}`]: value,
  });
};

export const getStyleValue = (type: keyof IValue, direction: keyof IInputDirection, value: string, 
  defaultMargin?:string) => {
  const v = JSON.parse(value || '{}') as IValue;
  return addPx((v || {})[`${type}${capitalizeFirstLetter(direction)}`] || defaultMargin ||'');
};
