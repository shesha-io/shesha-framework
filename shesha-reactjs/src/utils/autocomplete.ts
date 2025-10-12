import { useGet, usePrevious } from '@/hooks';
import { convertDotNotationPropertiesToGraphQL } from '@/providers/form/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { EntityData, IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import { GENERIC_ENTITIES_ENDPOINT } from '@/shesha-constants';
import { getEntityFilterByIds } from './graphQl';
import { isEqual } from 'lodash';

interface AutocompleteReturn {
  data: EntityData[];
  error: any;
  search: (term: string) => void;
  loading: boolean;
}

export type AutocompleteValueType = string | string[] | object | object[];

export interface IAutocompleteProps {
  entityType: string;
  filter?: string;
  maxResultCount?: number;
  displayProperty?: string;
  value?: AutocompleteValueType;
}

const buildFilterById = (value: AutocompleteValueType): string => {
  if (!value) return null;

  const ids = (Array.isArray(value) ? value : [value]).map((val) => {
    return typeof val === 'string' ? val : val?.id ?? undefined;
  }).filter((x) => Boolean(x));

  return getEntityFilterByIds(ids);
};

export const autocompleteValueIsEmpty = (value: AutocompleteValueType): boolean => {
  return Array.isArray(value) ? value.length === 0 : !Boolean(value);
};

/**
 * Generic entities autocomplete
 */
export const useEntityAutocomplete = (props: IAutocompleteProps): AutocompleteReturn => {
  const previousQueryParams = useRef<IGenericGetAllPayload>(null);
  const displayProperty = props.displayProperty || '_displayName';

  const [searchIsValid, setSearchIsValid] = useState<boolean>(false);

  const properties = convertDotNotationPropertiesToGraphQL(['id', displayProperty]);
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
      lazy: autocompleteValueIsEmpty(props.value),
      queryParams: getValuePayload,
    },
  );


  const listFetcher = useGet<IAbpWrappedGetEntityListResponse, any, IGenericGetAllPayload>(
    `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
    {
      lazy: true,
    },
  );

  const search = (term: string): void => {
    const queryParams = getListFetcherQueryParams(term);
    if (isEqual(queryParams, previousQueryParams.current))
      return;

    setSearchIsValid(false);
    previousQueryParams.current = queryParams;
    listFetcher.refetch({ queryParams }).then(() => {
      setSearchIsValid(true);
    });
  };

  const listItems = listFetcher.data?.result?.items;
  const valueItems = valueFetcher.data?.result?.items;

  const prevValue = usePrevious(props.value);
  useEffect(() => {
    // if value has cleared and we still have valid search results - invalidate them
    if (autocompleteValueIsEmpty(props.value) && !autocompleteValueIsEmpty(prevValue) && searchIsValid) {
      setSearchIsValid(false);
    }
  }, [props.value, prevValue, searchIsValid]);

  const allItems = useMemo(() => {
    const result = listItems ?? [];

    if (valueItems && props.value) {
      valueItems.forEach((i) => {
        if (result.findIndex((fi) => fi.id === i.id) === -1) result.push(i);
      });
    }

    return result;
  }, [listItems, valueItems, props.value, searchIsValid]);

  return {
    data: allItems,
    error: listFetcher.error ?? valueFetcher.error,
    search,
    loading: listFetcher.loading || valueFetcher.loading,
  };
};
