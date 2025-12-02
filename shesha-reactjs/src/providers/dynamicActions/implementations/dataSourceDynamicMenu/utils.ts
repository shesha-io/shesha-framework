import { useMemo } from 'react';
import { IDataSourceArguments } from './model';
import { buildUrl } from '@/utils/url';
import { useFormData } from '@/providers/formContext';
import { useGlobalState } from '@/providers/globalState';
import { useDataContextManagerActionsOrUndefined } from '@/providers/dataContextManager';
import { evaluateString } from '@/providers/form/utils';
import { FetcherOptions, IQueryParams } from '@/utils/fetchers';
import { getEntityTypeIdentifierQueryParams } from '@/providers/metadataDispatcher/entities/utils';

type UseUrlTemplatesResponse = {
  getUrlTemplateState: (evaluatedFilters?: any) => FetcherOptions;
};

export const useUrlTemplates = (settings: IDataSourceArguments): UseUrlTemplatesResponse => {
  const { dataSourceUrl, queryParams } = settings ?? {};
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const pageContext = useDataContextManagerActionsOrUndefined()?.getPageContext();

  const getQueryParams = useMemo(() => {
    return (): IQueryParams => {
      const queryParamObj: IQueryParams = {};
      if (queryParams?.length) {
        queryParams.forEach(({ param, value }) => {
          const valueAsString = value as string;
          if (param?.length && valueAsString?.length) {
            queryParamObj[param] = /{.*}/i.test(valueAsString)
              ? evaluateString(valueAsString, { data, globalState, pageContext: { ...pageContext?.getFull() } })
              : value;
          }
        });
      }
      return queryParamObj;
    };
  }, [queryParams, data, globalState, pageContext]);

  const getUrlTemplateState = useMemo(() => {
    return () => {
      if (!dataSourceUrl) return null;

      const dataSourceUrlString = dataSourceUrl.id ?? dataSourceUrl;
      const path = buildUrl(dataSourceUrlString, getQueryParams());
      return { path };
    };
  }, [dataSourceUrl, getQueryParams]);

  return { getUrlTemplateState };
};

type UseEntityTemplatesResponse = {
  getEntityTemplateState: (evaluatedFilters?: any, proprties?: string) => FetcherOptions;
};

export const useEntityTemplates = (settings: IDataSourceArguments): UseEntityTemplatesResponse => {
  const { entityType, maxResultCount } = settings ?? {};
  const getEntityTemplateState = (evaluatedFilters?: any, proprties?: string): FetcherOptions => {
    return {
      path: `/api/services/app/Entities/GetAll`,
      queryParams: {
        ...getEntityTypeIdentifierQueryParams(entityType),
        maxResultCount: maxResultCount || 100,
        properties: proprties,
        filter: evaluatedFilters,
      },
    };
  };

  return { getEntityTemplateState };
};
