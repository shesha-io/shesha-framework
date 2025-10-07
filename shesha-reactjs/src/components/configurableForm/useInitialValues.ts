import { IKeyValue } from './../../interfaces/keyValue';
import { getQueryParams } from './../../utils/url';
import _ from 'lodash';
import { evaluateComplexString, evaluateValue, IMatchData } from '@/providers/form/utils';

export const getInitialValues = (
  initialValues: IKeyValue[],
  globalState?: any,
  parentFormValues?: any,
  formData?: any
): object => {
  const queryParams = getQueryParams();

  if (!initialValues) return {};

  const computedInitialValues = {} as object;

  const mappings: IMatchData[] = [
    { match: 'data', data: formData },
    { match: 'parentFormValues', data: parentFormValues },
    { match: 'globalState', data: globalState },
    { match: 'query', data: queryParams },
    // { match: 'initialValues', data: initialValues },
  ];

  initialValues?.forEach(({ key, value }) => {
    const evaluatedValue = value?.includes('{{')
      ? evaluateComplexString(value, mappings)
      : value?.includes('{')
        ? evaluateValue(value, {
          data: formData,
          parentFormValues: parentFormValues,
          globalState: globalState,
          query: queryParams,
        })
        : value;
    _.set(computedInitialValues, key, evaluatedValue);
  });

  return computedInitialValues;
};
