import { useGet, UseGetProps } from '@/hooks/useGet';
import * as RestfulShesha from '@/utils/fetchers';

/**
 * Dynamic data result
 */
export interface IDynamicDataResult {
  [key: string]: any;
}

export interface EntitiesGetQueryParams {
  name?: string;
  module?: string;

  entityType?: string;
  /**
   * List of properties to fetch in GraphQL-like syntax. Supports nested properties
   */
  properties?: string;
  id?: string;
  'api-version'?: string;
}

export type entitiesGetProps = Omit<
  RestfulShesha.GetProps<IDynamicDataResult, unknown, EntitiesGetQueryParams, void>,
  'queryParams'
>;
export const entitiesGet = (queryParams: EntitiesGetQueryParams, props: entitiesGetProps) =>
  RestfulShesha.get<IDynamicDataResult, unknown, EntitiesGetQueryParams, void>(
    `/api/services/app/Entities/Get`,
    queryParams,
    props,
);

export interface EntitiesGetAllQueryParams {
  name?: string;
  module?: string;
  
  entityType?: string;
  /**
   * List of properties to fetch in GraphQL-like syntax. Supports nested properties
   */
  properties?: string;
  /**
   * Filter string in JsonLogic format
   */
  filter?: string;
  /**
   * Quick search string. Is used to search entities by text
   */
  quickSearch?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
  'api-version'?: string;
}

export type UseEntitiesGetAllProps = Omit<UseGetProps<IDynamicDataResult, EntitiesGetAllQueryParams, void>, 'path'>;

export const useEntitiesGetAll = (props: UseEntitiesGetAllProps) =>
  useGet<IDynamicDataResult, unknown, EntitiesGetAllQueryParams, void>(`/api/services/app/Entities/GetAll`, props);
