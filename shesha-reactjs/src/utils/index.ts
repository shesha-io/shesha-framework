import { IAnchoredDirection, IStoredFilter } from '@/providers/dataTable/interfaces';
import { NestedPropertyMetadatAccessor } from '@/providers/metadataDispatcher/contexts';
import { IArgumentEvaluationResult, convertJsonLogicNode } from './jsonLogic';
import { IMatchData, executeExpression } from '@/providers/form/utils';
import { Cell } from 'react-table';
import { IPersistedFormProps } from '@/providers';
import { CSSProperties } from 'react';
import { ISidebarGroup } from '@/interfaces/sidebar';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';

export type NumberOrString = number | string;

export const getDynamicPath = (formId: IReferenceListIdentifier) =>
  `/dynamic/${formId?.module}/${formId?.name}`;

export const getSelectedKeys = (path: string, menuItems: ISidebarGroup[]) => {
  const keys = menuItems.find((item) =>
    [
      item?.actionConfiguration?.actionArguments?.url,
      getDynamicPath(item?.actionConfiguration?.actionArguments?.formId),
    ].includes(path)
  );
  return keys ? [keys?.id] : [];
};

export const filterObjFromKeys = <T = any>(value: T, keys: Array<keyof T>) =>
  keys.length > 0
    ? Object.entries(value || {})
        .filter(([key]) => keys.includes(key as any))
        .reduce((acc, [key, value]) => ({ ...acc, ...{ [key]: value } }), {})
    : value;


/**
 * Returns the parameter value, from the url, by name
 *
 * @param {string} name Parameter name
 * @param {string} url The url
 * @returns {string} The value of this parameter
 */
export default (name: string, url?: string) => {
  const localUrl = !url ? window.location.href : url;
  const localName = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + localName + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(localUrl);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

//#endregion

const scrollHorizontally = (eventParam: any, element: any) => {
  const event = window.event || eventParam;
  const localElement = element;

  const delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
  localElement.scrollLeft -= delta * 40;

  event.preventDefault();
};

export const horizontalMouseScroll = (scrollableId: string) => {
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
export const compareValues = (firstVal: NumberOrString, secondVal: NumberOrString) => firstVal !== secondVal;

/**
 * Returns only digits from a given string
 *
 * @param value - a string to extract digits from
 */
export const extractDigitsFromString = (value: string) => {
  const extracted = typeof value === 'string' && !!value.trim() ? value.match(/\d+/g) : '';

  return extracted ? extracted.join('') : '';
};

/**
 * The method returns a safely trimmed string
 *
 * @param value - the string value to trim
 */
export const getSafelyTrimmedString = (value: string = '') => {
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
export const joinStringValues = (values: string[], delimiter = ' ') => {
  return values?.filter(Boolean)?.join(delimiter);
};

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (_key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

export const getValidDefaultBool = (value: any, defalutValue: boolean = true) =>
  typeof value === 'boolean' ? value : defalutValue;

export const getPlainValue = <T = object | any[]>(value: T): T => {
  try {
    return JSON.parse(JSON.stringify(value, getCircularReplacer()));
  } catch {
    return value;
  }
};

export const getColumnAnchored = (anchored: string) => {
  if (anchored === 'left') {
    return {
      isFixed: true,
      direction: 'left',
    };
  } else if (anchored === 'right') {
    return {
      isFixed: true,
      direction: 'right',
    };
  } else {
    return {
      isFixed: false,
    };
  }
};

export const calculateTotalColumnsOnFixed = (row: Cell<any, any, any>[], direction: IAnchoredDirection) => {
  return row?.filter(({ column }: any) => getColumnAnchored(column?.anchored).direction === direction)?.length;
};

export const calculatePositionShift = (row: Cell<any, any, any>[], start: number, end: number) => {
  return row?.slice(start, end)?.map((col) => {
    const isLessThanMinWidth = (col?.column?.width as number) < col?.column?.minWidth;
    return isLessThanMinWidth ? col?.column?.minWidth : col?.column?.width;
  }) as Array<number>;
};

export const getStaticExecuteExpressionParams = (params: string, dynamicParam?: { [key: string]: any }) => {
  let parameters = params;

  Object.keys(dynamicParam || {}).map((key) => {
    parameters = parameters ? `${parameters}, ${key}` : key;
  });

  return parameters;
};

export const executeExpressionPayload = (fn: Function, dynamicParam: { [key: string]: any }, ...args: any[]) => {
  const argList = [...args];
  Object.values(dynamicParam || {}).map((key) => argList.push(key));

  return fn.apply(null, argList);
};

export const evaluateDynamicFilters = async (
  filters: IStoredFilter[],
  mappings: IMatchData[],
  propertyMetadataAccessor: NestedPropertyMetadatAccessor
): Promise<IStoredFilter[]> => {
  if (filters?.length === 0 || !mappings?.length) return filters;

  const convertedFilters = await Promise.all(
    filters.map(async (filter) => {
      // correct way of processing JsonLogic rules
      if (typeof filter.expression === 'object') {
        const evaluator = (operator: string, args: object[], argIndex: number): IArgumentEvaluationResult => {
          const argValue = args[argIndex];
          // special handling for specifications
          // TODO: move `is_satisfied` operator name to constant
          if (operator === 'is_satisfied' && argIndex === 1) {
            // second argument is an expression that should be converted to boolean
            if (typeof argValue === 'string') {
              const evaluationContext = mappings.reduce((acc, item) => ({ ...acc, [item.match]: item.data }), {});
              const evaluatedValue = executeExpression<boolean>(argValue, evaluationContext, false, (err) => {
                console.error('Failed to convert value', err);
                return null;
              });

              return { handled: evaluatedValue !== null, value: Boolean(evaluatedValue) };
            }
          }

          return { handled: false };
        };

        const evaluationData = {
          hasDynamicExpression: false,
          allFieldsEvaluatedSuccessfully: true,
          unevaluatedExpressions: [],
        };

        const getVariableDataType = (variable: string): Promise<string> => {
          return propertyMetadataAccessor
            ? propertyMetadataAccessor(variable).then((m) => m?.dataType)
            : Promise.resolve('string');
        };

        const convertedExpression = await convertJsonLogicNode(filter.expression, {
          argumentEvaluator: evaluator,
          mappings,
          getVariableDataType,
          onEvaluated: (args) => {
            evaluationData.hasDynamicExpression = true;
            evaluationData.allFieldsEvaluatedSuccessfully =
              evaluationData.allFieldsEvaluatedSuccessfully && args.success;
            if (args.unevaluatedExpressions && args.unevaluatedExpressions.length)
              evaluationData.unevaluatedExpressions.push(...args.unevaluatedExpressions);
          },
        });
        return {
          ...filter,
          ...evaluationData,
          expression: convertedExpression,
        } as IStoredFilter;
      }

      return Promise.resolve(filter);
    })
  );

  return convertedFilters;
};

export const getUrlKeyParam = (url: string = ''): '?' | '&' => (url?.includes('?') ? '&' : '?');

export const removeEmptyArrayValues = (list: any[]) =>
  Array.isArray(list) && list.length ? list.filter((item) => !!item) : [];

export const executeFunction = (expression: string, args: { [key: string]: any }) => {
  try {
    return expression
      ? executeExpressionPayload(new Function(getStaticExecuteExpressionParams(null, args), expression), args)
      : null;
  } catch {
    return null;
  }
};

export const getToolboxComponentsVisibility = (props: IPersistedFormProps, configs: IPersistedFormProps[]) =>
  configs.some(({ name: n, module: m }) => props?.module === m && props?.name === n);

export const convertJsonToCss = (style: CSSProperties) => {
  const css = Object.entries(style || {})
    .map(([k, v]) => [k.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`), v])
    .map(([k, v]) => `${k}:${v}`)
    .join(';');

  return !!css ? `${css};` : null;
};

export { unwrapAbpResponse } from './fetchers';
export * from './metadata/index';