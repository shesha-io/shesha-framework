import { useMemo } from 'react';
import { removeZeroWidthCharsFromString } from '../..';
import { IFormSettings } from '../../providers/form/models';
import { evaluateComplexString } from '../../providers/form/utils';
import { getQueryParams } from '../../utils/url';

export const useSubmitUrl = (
  formSettings: IFormSettings,
  httpVerb: 'POST' | 'PUT' | 'DELETE',
  formData: any,
  parentFormValues: any,
  globalState: any
) => {
  /**
   * This function return the submit url.
   *
   * @returns
   */
  return useMemo(() => {
    //console.log('LOG: calculate submiturl')
    const { postUrl, putUrl, deleteUrl } = formSettings || {};
    let url = postUrl; // Fallback for now

    if (httpVerb === 'POST' && postUrl) {
      url = postUrl;
    }

    if (httpVerb === 'PUT' && putUrl) {
      url = putUrl;
    }

    if (httpVerb === 'DELETE' && deleteUrl) {
      url = deleteUrl;
    }

    url = removeZeroWidthCharsFromString(url);

    url = evaluateComplexString(url, [
      { match: 'query', data: getQueryParams() },
      { match: 'data', data: formData },
      { match: 'parentFormValues', data: parentFormValues },
      { match: 'globalState', data: globalState },
    ]);

    return url;
  }, [formSettings]);
};
