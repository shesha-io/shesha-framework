import { IKeyValue } from './../../interfaces/keyValue';
import { getQueryParams } from './../../utils/url';
import { IFormSettings, useFormData, useGlobalState } from './../../providers';
import _ from 'lodash';
import { useMemo } from 'react';
import { evaluateComplexString, evaluateValue, IMatchData } from '@/providers/form/utils';

export const useInitialValues = (settings: IFormSettings, parentFormValues: any) => {
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();
  const queryParams = getQueryParams();

  const initialValuesFromSettings = useMemo(() => {
    if (!settings?.initialValues) return {};

    const computedInitialValues = {} as object;

    const mappings: IMatchData[] = [
      { match: 'data', data: formData },
      { match: 'parentFormValues', data: parentFormValues },
      { match: 'globalState', data: globalState },
      { match: 'query', data: queryParams },
      // { match: 'initialValues', data: initialValues },
    ];

    settings?.initialValues?.forEach(({ key, value }) => {
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
  }, [settings]);

  return initialValuesFromSettings;
};

export const getInitialValues = (
  initialValues: IKeyValue[],
  globalState?: any,
  parentFormValues?: any,
  formData?: any
) => {
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
