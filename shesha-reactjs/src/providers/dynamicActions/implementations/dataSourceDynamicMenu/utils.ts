import { evaluateString, IStyleType, useDataContextManagerActions, useFormData, useGlobalState } from '@/index';
import { Key, useMemo } from 'react';
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

export const defaultStyles = (prev): IStyleType => {

  return {
    background: { type: prev.background?.type ?? 'color', color: prev.background?.color ?? prev.backgroundColor },
    font: {
      color: prev.font?.color ?? prev.fontColor ?? '',
      weight: prev.font?.weight ?? prev.fontWeight ?? '400',
      size: prev.font?.size ?? prev.fontSize ?? 14,
      type: prev.font?.type ?? prev.fontFamily ?? 'Segoe UI',
      align: prev.font?.align ?? 'center'
    },
    border: {
      borderType: prev.border?.borderType ?? 'all',
      radiusType: prev.border?.radiusType ?? 'all',
      border: {
        all: {
          width: prev.border?.width ?? prev?.borderWidth ?? '1px',
          style: prev.border?.style ?? prev?.borderStyle ?? 'solid',
          color: prev.border?.color ?? prev?.borderColor ?? '#d9d9d9'
        },
      },
      radius: { all: prev.border?.radius ?? prev.borderRadius ?? prev.size === 'small' ? 4 : 8 }
    },
    shadow: {
      spreadRadius: prev.shadow?.spreadRadius ?? 0,
      blurRadius: prev.shadow?.blurRadius ?? 0,
      color: prev.shadow?.color ?? '#000',
      offsetX: prev.shadow?.offsetX ?? 0,
      offsetY: prev.shadow?.offsetY ?? 0
    },
    dimensions: {
      width: prev.dimensions?.width ?? prev.block ? '100%' : 'auto',
      height: prev.dimensions?.height ?? prev.height ?? prev.size === 'small' ? '24px' : prev.size === 'middle' ? '32px' : '40px',
      minHeight: prev.dimensions?.minHeight ?? '0px',
      maxHeight: prev.dimensions?.maxHeight ?? 'auto',
      minWidth: prev.dimensions?.minWidth ?? '0px',
      maxWidth: prev.dimensions?.maxWidth ?? 'auto'
    },
    style: prev.style ?? '',
    stylingBox: prev.stylingBox ?? '{"paddingLeft":"15","paddingBottom":"4","paddingTop":"4","paddingRight":"15"}',
  };
};
