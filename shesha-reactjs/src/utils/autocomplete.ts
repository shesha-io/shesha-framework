import { useMemo } from 'react';
import { useGet } from 'restful-react';
import { GENERIC_ENTITIES_ENDPOINT } from '../constants';
import { IAbpWrappedGetEntityListResponse, EntityData, IGenericGetAllPayload } from '../interfaces/gql';
import { convertDotNotationPropertiesToGraphQL } from '../providers/form/utils';
import { getEntityFilterByIds } from './graphQl';

interface AutocompleteReturn {
  data: EntityData[];
  error: any;
  search: (term: string) => void;
  loading: boolean;
}

export type AutocompleteValueType = string | string[];

export interface IAutocompleteProps {
  entityType: string;
  filter?: string;
  maxResultCount?: number;
  displayProperty?: string;
  value?: AutocompleteValueType;
  lazy?: boolean;
}

const buildFilterById = (value: AutocompleteValueType): string => {
  if (!value) return null;

  const ids = Array.isArray(value) ? value : [value];
  return getEntityFilterByIds(ids);
};

/**
 * Generic entities autocomplete
 */
export const useEntityAutocomplete = (props: IAutocompleteProps): AutocompleteReturn => {
  const displayProperty = props.displayProperty || '_displayName';
  const properties = convertDotNotationPropertiesToGraphQL(['id', displayProperty], []);
  const getListFetcherQueryParams = (term: string): IGenericGetAllPayload => {
    return {
      skipCount: 0,
      maxResultCount: props.maxResultCount ?? 10,
      entityType: props.entityType,
      properties: properties,
      quickSearch: term,
      filter: props?.filter,
      sorting: displayProperty,
    };
  };

  // current value can be already loaded as part of list! check it and skip fetching

  const getValuePayload: IGenericGetAllPayload = {
    skipCount: 0,
    maxResultCount: 1000,
    entityType: props.entityType,
    properties: properties,
    sorting: displayProperty,
    filter: buildFilterById(props.value),
  };
  const valueFetcher = useGet<IAbpWrappedGetEntityListResponse, any, IGenericGetAllPayload>(
    `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
    {
      lazy: !props.value,
      queryParams: getValuePayload,
    }
  );

  const listFetcher = useGet<IAbpWrappedGetEntityListResponse, any, IGenericGetAllPayload>(
    `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
    {
      lazy: props.lazy ?? true,
      queryParams: getListFetcherQueryParams(null),
    }
  );

  const search = (term: string) => {
    listFetcher.refetch({ queryParams: getListFetcherQueryParams(term) });
  };

  const listItems = listFetcher.data?.result?.items;
  const valueItems = valueFetcher.data?.result?.items;

  const allItems = useMemo(() => {
    const result = listItems ?? [];

    if (valueItems) {
      valueItems.forEach(i => {
        if (result.findIndex(fi => fi.id === i.id) === -1) result.push(i);
      });
    }

    return result;
  }, [listItems, valueItems]);

  return {
    data: allItems,
    error: listFetcher.error ?? valueFetcher.error,
    search,
    loading: listFetcher.loading || valueFetcher.loading,
  };
};
