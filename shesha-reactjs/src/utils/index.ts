import { IPersistedFormProps } from '@/providers';
import { CSSProperties } from 'react';
import { ISidebarGroup } from '@/interfaces/sidebar';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';

export type NumberOrString = number | string;

export const getDynamicPath = (formId: IReferenceListIdentifier): string =>
  `/dynamic/${formId?.module}/${formId?.name}`;

export const getSelectedKeys = (path: string, menuItems: ISidebarGroup[]): string[] => {
  const keys = menuItems.find((item) =>
    [
      item?.actionConfiguration?.actionArguments?.url,
      getDynamicPath(item?.actionConfiguration?.actionArguments?.formId),
    ].includes(path),
  );
  return keys ? [keys?.id] : [];
};

export const filterObjFromKeys = <T extends object = object>(value: T, keys: Array<keyof T>): Partial<T> =>
  keys.length > 0
    ? Object.entries(value || {})
      .filter(([key]) => keys.includes(key as any))
      .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {})
    : value;


const scrollHorizontally = (eventParam: any, element: any): void => {
  const event = window.event || eventParam;
  const localElement = element;

  const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
  localElement.scrollLeft -= delta * 40;

  event.preventDefault();
};

export const horizontalMouseScroll = (scrollableId: string): void => {
  try {
    const element = document.getElementById(scrollableId);
    if (!element) return;

    if (element.addEventListener) {
      // IE9, Chrome, Safari, Opera
      element.addEventListener('mousewheel', (event) => scrollHorizontally(event, element), false);

      // Firefox
      element.addEventListener('DOMMouseScroll', (event) => scrollHorizontally(event, element), false);
    } else {
      // IE 6/7/8
      // element.attachEvent('onmousewheel', event =>
      //   scrollHorizontally(event, element)
      // );
    }
  } catch (error) {
    console.error('horizontalMouseScroll error: ', error);
  }
};

/**
 * Compares two values and returns true if they have changed, else false
 *
 * @param firstVal - the first value
 * @param secondVal - the second value
 */
export const compareValues = (firstVal: NumberOrString, secondVal: NumberOrString): boolean => firstVal !== secondVal;

/**
 * Returns only digits from a given string
 *
 * @param value - a string to extract digits from
 */
export const extractDigitsFromString = (value: string): string => {
  const extracted = typeof value === 'string' && !!value.trim() ? value.match(/\d+/g) : '';

  return extracted ? extracted.join('') : '';
};

/**
 * The method returns a safely trimmed string
 *
 * @param value - the string value to trim
 */
export const getSafelyTrimmedString = (value: string = ''): string => {
  if (!value || typeof value !== 'string') return '';

  return value.trim();
};

/**
 * Joins string values, filtering out falsy values
 *
 * @param values values to join
 * @param delimiter delimiter to use to join the values
 * @returns joined string value
 */
export const joinStringValues = (values: string[], delimiter = ' '): string | undefined => {
  return values?.filter(Boolean)?.join(delimiter);
};

type JsonReplacer = (key: string, value: unknown) => unknown;

export const getCircularReplacer = (): JsonReplacer => {
  const seen = new WeakSet();
  return (_key: string, value: unknown): unknown => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return undefined;
      }
      seen.add(value);
    }
    return value;
  };
};

export const getValidDefaultBool = (value: unknown, defalutValue: boolean = true): boolean =>
  typeof value === 'boolean' ? value : defalutValue;

export const getPlainValue = <T = object | any[]>(value: T): T => {
  try {
    return JSON.parse(JSON.stringify(value, getCircularReplacer()));
  } catch {
    return value;
  }
};

export const getStaticExecuteExpressionParams = (params: string, dynamicParam?: { [key: string]: any }): string => {
  let parameters = params;

  Object.keys(dynamicParam || {}).map((key) => {
    parameters = parameters ? `${parameters}, ${key}` : key;
  });

  return parameters;
};

export const executeExpressionPayload = (fn: Function, dynamicParam: { [key: string]: any }, ...args: any[]): unknown => {
  const argList = [...args];
  Object.values(dynamicParam || {}).map((key) => argList.push(key));

  return fn.apply(null, argList);
};

export const executeFunction = <TResult = unknown>(expression: string, args: { [key: string]: any }): TResult => {
  try {
    return expression
      ? executeExpressionPayload(new Function(getStaticExecuteExpressionParams(null, args), expression), args) as TResult
      : null;
  } catch {
    return null;
  }
};

export const getUrlKeyParam = (url: string = ''): '?' | '&' => (url?.includes('?') ? '&' : '?');

export const removeEmptyArrayValues = <TItem = unknown>(list: TItem[]): TItem[] =>
  Array.isArray(list) && list.length ? list.filter((item) => !!item) : [];

export const getToolboxComponentsVisibility = (props: IPersistedFormProps, configs: IPersistedFormProps[]): boolean =>
  configs.some(({ name: n, module: m }) => props?.module === m && props?.name === n);

export const convertJsonToCss = (style: CSSProperties): string | null => {
  const css = Object.entries(style || {})
    .map(([k, v]) => [k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`), v])
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

  return !!css ? `${css};` : null;
};

export { unwrapAbpResponse } from './fetchers';
export * from './metadata/index';
