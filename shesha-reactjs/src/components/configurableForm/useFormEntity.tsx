import _ from 'lodash';
import { useEffect } from 'react';
import { usePrevious } from 'react-use';
import { useGet } from 'restful-react';
import { IAnyObject } from '../../interfaces';
import { useSheshaApplication } from '../../providers';
import { IFormSettings } from '../../providers/form/contexts';
import { evaluateKeyValuesToObjectMatchedData } from '../../providers/form/utils';
import { getQueryParams } from '../../utils/url';

interface IUseFormEntityProps {
  parentFormValues: any;
  skipFetchData: boolean;
  formData: any;
  formSettings: IFormSettings;
  globalState: any;
}

/**
 * A hook for fetching the form entity
 * @param parentFormValues parent form values to use to create query parameters
 * @returns formEntity
 */
export const useFormEntity = (props: IUseFormEntityProps) => {
  // const { parentFormValues, skipFetchData = false, formData, formSettings, globalState } = props;
  // const { backendUrl } = useSheshaApplication();

  // const { refetch: fetchEntity, error: fetchEntityError, data: fetchedEntity } = useGet({
  //   path: formSettings?.getUrl || '',
  //   lazy: true,
  // });

  // const previousProps = usePrevious(props);

  // const getUrl = formSettings?.getUrl;
  // useEffect(() => {
  //   if (skipFetchData) {
  //     return;
  //   }

  //   if (_.isEqual(props, previousProps)) {
  //     return;
  //   }

  //   if (getUrl) {
  //     const fullUrl = `${backendUrl}${getUrl}`;
  //     const urlObj = new URL(decodeURIComponent(fullUrl));
  //     const rawQueryParamsToBeEvaluated = getQueryParams(fullUrl);
  //     const queryParamsFromAddressBar = getQueryParams();

  //     let queryParams: IAnyObject;

  //     if (fullUrl?.includes('?')) {
  //       if (fullUrl?.includes('{{')) {
  //         queryParams = evaluateKeyValuesToObjectMatchedData(rawQueryParamsToBeEvaluated, [
  //           { match: 'data', data: formData },
  //           { match: 'parentFormValues', data: parentFormValues },
  //           { match: 'globalState', data: globalState },
  //           { match: 'query', data: queryParamsFromAddressBar },
  //         ]);
  //       } else {
  //         queryParams = rawQueryParamsToBeEvaluated;
  //       }
  //     }

  //     if (getUrl && !_.isEmpty(queryParams)) {
  //       if (Object.hasOwn(queryParams, 'id') && !Boolean(queryParams['id'])) {
  //         console.error('id cannot be null');
  //         return;
  //       }

  //       fetchEntity({
  //         queryParams,
  //         path: urlObj?.pathname,
  //         base: urlObj?.origin,
  //       });
  //     }
  //   }
  // }, []);
  // // }, [parentFormValues, skipFetchData, formData, formSettings, globalState]);

  // if (fetchEntityError) {
  //   return new Error(fetchEntityError?.message ?? fetchEntityError?.data);
  // }

  return null;
  // return fetchedEntity?.result;
};
