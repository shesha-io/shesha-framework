import { useMemo } from 'react';
import { IDataSourceArguments } from './model';
import { buildUrl } from '@/utils/url';
import { useFormData } from '@/providers/formContext';
import { useGlobalState } from '@/providers/globalState';
import { useDataContextManagerActionsOrUndefined } from '@/providers/dataContextManager';
import { evaluateString } from '@/providers/form/utils';
import { FetcherOptions, IQueryParams } from '@/utils/fetchers';
import { isNullOrWhiteSpace } from '@/utils/nullables';

type UseUrlTemplatesResponse = {
  getUrlTemplateState: () => FetcherOptions | undefined;
};

export const useUrlTemplates = (settings: IDataSourceArguments | undefined): UseUrlTemplatesResponse => {
  const { dataSourceUrl, queryParams } = settings ?? {};
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const pageContext = useDataContextManagerActionsOrUndefined()?.getPageContext();

  const getQueryParams = useMemo(() => {
    return (): IQueryParams => {
      const queryParamObj: IQueryParams = {};
      if (queryParams?.length) {
        queryParams.forEach(({ param, value }) => {
          if (!isNullOrWhiteSpace(param) && !isNullOrWhiteSpace(value)) {
            queryParamObj[param] = /{.*}/i.test(value)
              ? evaluateString(value, { data, globalState, pageContext: { ...pageContext?.getFull() } })
              : value;
          }
        });
      }
      return queryParamObj;
    };
  }, [queryParams, data, globalState, pageContext]);

  const getUrlTemplateState = useMemo(() => {
    return () => {
      if (isNullOrWhiteSpace(dataSourceUrl))
        return undefined;

      const path = buildUrl(dataSourceUrl, getQueryParams());
      return { path };
    };
  }, [dataSourceUrl, getQueryParams]);

  return { getUrlTemplateState };
};
