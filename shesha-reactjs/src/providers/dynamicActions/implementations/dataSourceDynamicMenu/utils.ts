import { evaluateString, IStyleType, useDataContextManagerActions, useFormData, useGlobalState } from '@/index';
import { Key } from 'react';
import { IDataSourceArguments } from './model';
import { buildUrl } from '@/utils/url';

interface IQueryParams {
  [name: string]: Key;
}

export const useTemplates = (settings: IDataSourceArguments) => {
  const { dataSourceUrl, queryParams, entityTypeShortAlias, maxResultCount } = settings ?? {};
  const { data } = useFormData();
  const { globalState } = useGlobalState();
  const pageContext = useDataContextManagerActions(false)?.getPageContext();

  const getQueryParams = (): IQueryParams => {
    const queryParamObj: IQueryParams = {};
    if (queryParams && queryParams?.length) {
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

  const getTemplateState = (evaluatedFilters?: any) => {
    if (dataSourceUrl !== undefined) {
      const dataSourceUrlString = dataSourceUrl.id ? dataSourceUrl.id : dataSourceUrl;
      const path = buildUrl(dataSourceUrlString, getQueryParams());
      return {
        path,
      };
    }

    return {
      path: `/api/services/app/Entities/GetAll`,
      queryParams: {
        entityType: entityTypeShortAlias,
        maxResultCount: maxResultCount || 100,
        filter: evaluatedFilters,
      },
    };
  };

  return { getTemplateState, getQueryParams };
};


export const defaultStyles = (prev): IStyleType => {

  return {
    background: { type: 'color', color: prev.backgroundColor, },
    font: { color: prev.buttonType === 'primary' ? '#fff' : prev.fontColor ?? '#000', weight: prev.fontWeight ?? '400', size: prev.fontSize ?? 14, type: prev.fontFamily ?? 'Segoe UI', align: 'center' },
    border: {
      borderType: 'all',
      radiusType: 'all',
      border: {
        all: {
          width: prev.borderWidth ?? '1px',
          style: prev.borderStyle ?? 'solid',
          color: prev.borderColor ?? '#d9d9d9'
        },
      },
      radius: { all: prev.borderRadius ?? prev.size === 'small' ? 4 : 8 }
    },
    shadow: { spreadRadius: 0, blurRadius: 0, color: '#000', offsetX: 0, offsetY: 0 },
    dimensions: {
      width: prev.block ? '100%' : 'auto',
      height: prev.height ?? prev.size === 'small' ? '24px' : prev.size === 'middle' ? '32px' : '40px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto'
    },
    stylingBox: '{"paddingLeft":"15","paddingBottom":"4","paddingTop":"4","paddingRight":"15"}',
  };
};
