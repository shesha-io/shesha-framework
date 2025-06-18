import { evaluateString, useDataContextManagerActions, useFormData, useGlobalState } from '@/index';
import { Key } from 'react';
import { IDataSourceArguments } from './model';
import { buildUrl } from '@/utils/url';

interface IQueryParams {
  [name: string]: Key;
}

export const useUrlTemplates = (settings: IDataSourceArguments) => {
  const { dataSourceUrl, queryParams } = settings ?? {};
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const pageContext = useDataContextManagerActions(false)?.getPageContext();

  const getQueryParams = (): IQueryParams => {
    const queryParamObj: IQueryParams = {};
    if (queryParams?.length) {
      queryParams?.forEach(({ param, value }) => {
        const valueAsString = value as string;
        if (param?.length && valueAsString.length) {
          queryParamObj[param] = /{.*}/i.test(valueAsString)
            ? evaluateString(valueAsString, { data, globalState, pageContext: { ...pageContext.getFull() } })
            : value;
        }
      });
    }
    return queryParamObj;
  };

  const getUrlTemplateState = () => {
    const dataSourceUrlString = dataSourceUrl.id ?? dataSourceUrl;
    const path = buildUrl(dataSourceUrlString, getQueryParams());
    return {
      path,
    };
  };

  return { getUrlTemplateState };
};

export const useEntityTemplates = (settings: IDataSourceArguments) => {
  const { entityTypeShortAlias, maxResultCount } = settings ?? {};
  const getEntityTemplateState = (evaluatedFilters?: any) => {
    return {
      path: `/api/services/app/Entities/GetAll`,
      queryParams: {
        entityType: entityTypeShortAlias,
        maxResultCount: maxResultCount || 100,
        filter: evaluatedFilters,
      },
    };
  };

  return { getEntityTemplateState };
};
