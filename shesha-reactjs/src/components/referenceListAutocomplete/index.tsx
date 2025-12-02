import { AutoComplete, Empty, Spin, Typography } from 'antd';
import React, { ReactNode, useEffect, useMemo, useRef, useState, FC } from 'react';

import { useGet } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { GENERIC_ENTITIES_ENDPOINT, LEGACY_REFERENCE_LISTS_MODULE_NAME } from '@/shesha-constants';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import HelpTextPopover from '@/components/helpTextPopover';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IReferenceListAutocompleteRuntimeProps {
  value?: IReferenceListIdentifier;
  onChange?: (value?: IReferenceListIdentifier) => void;
  readOnly?: boolean;
  maxResultCount?: number;
  size?: SizeType;
}

interface IOption {
  label: string | ReactNode;
  value: string;
  data: IReferenceListIdentifier;
  options?: IOption[];
}

const baseItemFilter = [
];

const baseListFilter = {
  "!=": [
    {
      var: "module",
    },
    null,
  ],
};

const getFilter = (term: string): string => {
  const termFilter = term
    ? {
      or: [
        { in: [term, { var: 'name' }] },
        { in: [term, { var: 'module.name' }] },
      ],
    }
    : undefined;

  const allFilters = [baseListFilter, termFilter].filter((f) => Boolean(f));
  const filter = allFilters.length === 0
    ? undefined
    : allFilters.length === 1
      ? allFilters[0]
      : { and: allFilters };

  return JSON.stringify(filter);
};
const REFERENCE_LIST_ENTITY_TYPE = 'Shesha.Framework.ReferenceList';
const REFERENCE_LIST_PROPERTIES = 'id name module { id name } label description';
const getListFetcherQueryParams = (term: string, maxResultCount): IGenericGetAllPayload => {
  return {
    skipCount: 0,
    maxResultCount: maxResultCount ?? 10,
    entityType: REFERENCE_LIST_ENTITY_TYPE,
    properties: REFERENCE_LIST_PROPERTIES,
    quickSearch: null,
    filter: getFilter(term),
    sorting: 'module.name, name',
  };
};
const getSelectedValueQueryParams = (value?: IReferenceListIdentifier): IGenericGetAllPayload => {
  if (!value)
    return null;

  const filters = [
    ...baseItemFilter,
    { '==': [{ var: 'name' }, value.name] },
  ];
  if (value.module !== undefined)
    filters.push({ '==': [{ var: 'module.name' }, value.module] });

  const expression = { and: filters };

  return expression
    ? {
      skipCount: 0,
      maxResultCount: 1000,
      entityType: REFERENCE_LIST_ENTITY_TYPE,
      properties: REFERENCE_LIST_PROPERTIES,
      filter: JSON.stringify(expression),
    }
    : null;
};

interface IResponseItem {
  id: string;
  name: string;
  module?: {
    id: string;
    name: string;
  };
  label?: string;
  description?: string;
};

interface IConfigurationItemProps {
  name: string;
  label?: string;
  description?: string;
}

const RefListLabel: FC<IConfigurationItemProps> = ({ name, description, label }) => {
  const displayLabel = label && label !== name
    ? label
    : null;
  return (
    <div>
      <HelpTextPopover content={description}>
        <span>{name}</span>
      </HelpTextPopover>
      {displayLabel && (
        <><br /><Typography.Text type="secondary" ellipsis={true}>{displayLabel}</Typography.Text></>
      )}
    </div>
  );
};

const getDisplayText = (item: IResponseItem): string => {
  if (!item)
    return null;
  const fullName = item.name;

  return item.module
    ? `${item.module.name}:${fullName}`
    : fullName;
};

export const ReferenceListAutocomplete: FC<IReferenceListAutocompleteRuntimeProps> = (props) => {
  const selectedValue = useRef(null);
  const [autocompleteText, setAutocompleteText] = useState<string>(null);
  const {
    maxResultCount = 10,
  } = props;

  const listFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, any, IGenericGetAllPayload>(
    `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
    {
      lazy: true,
      queryParams: getListFetcherQueryParams(null, maxResultCount),
    },
  );

  const valueFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, any, IGenericGetAllPayload>(
    `${GENERIC_ENTITIES_ENDPOINT}/GetAll`,
    {
      lazy: true,
    },
  );
  useEffect(() => {
    if (valueFetcher.data?.success && valueFetcher.data.result) {
      const items = valueFetcher.data.result?.items ?? [];
      if (items.length === 1) {
        const displayText = getDisplayText(items[0]);
        setAutocompleteText(displayText);
      } else
        console.error(items.length > 1 ? "Found more than one form with specified name" : "Reference list not found");
    }
  }, [valueFetcher.data?.result]);

  const listItems = listFetcher.data?.result?.items;
  const valueItems = valueFetcher.data?.result?.items;

  const fetchedItems = useMemo<IResponseItem[]>(() => {
    return listItems
      ? listItems
      : valueItems;
  }, [listItems, valueItems]);

  useEffect(() => {
    // fetch data if required
    const valueFetchParams = getSelectedValueQueryParams(props.value);
    if (valueFetchParams) {
      const selectedFromList = selectedValue.current && selectedValue.current === props.value;
      if (!selectedFromList)
        valueFetcher.refetch({ queryParams: valueFetchParams });
    }
  }, [props.value]);

  const options = useMemo<IOption[]>(() => {
    const result: IOption[] = [];
    if (fetchedItems) {
      fetchedItems.forEach((item) => {
        const moduleDto = item.module ?? { name: LEGACY_REFERENCE_LISTS_MODULE_NAME, id: '-' };

        const opt: IOption = {
          label: (
            <RefListLabel
              name={item.name}
              label={item.label}
              description={item.description}
            />
          ),
          value: getDisplayText(item),
          data: {
            name: item.name,
            module: item.module?.name,
          },
        };
        let group = result.find((g) => g.value === moduleDto.id);
        if (!group) {
          group = {
            label: moduleDto.name,
            value: moduleDto.id,
            data: null,
            options: [opt],
          };
          result.push(group);
        } else
          group.options.push(opt);
      });
    }

    return result;
  }, [fetchedItems]);

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    (localValue) => {
      listFetcher.refetch({ queryParams: getListFetcherQueryParams(localValue, maxResultCount) });
    },
    // delay in ms
    100,
  );


  const onSearch = (term): void => {
    debouncedFetchItems(term);
  };

  const onSelect = (_value, option): void => {
    const listId = (option as IOption)?.data;
    selectedValue.current = listId;
    if (props.onChange) {
      props.onChange(listId);
    }
  };

  const onClear = (): void => {
    selectedValue.current = null;
    if (props.onChange) {
      props.onChange(null);
    }
  };

  const loading = listFetcher.loading;

  return (
    <AutoComplete
      allowClear
      notFoundContent={loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
      style={{ width: '100%' }}
      options={options}
      onSearch={onSearch}
      onSelect={onSelect}
      onClear={onClear}
      placeholder={valueFetcher.loading ? 'Loading...' : 'Type to search'}
      disabled={valueFetcher.loading || props.readOnly}
      size={props?.size}

      value={autocompleteText}
      onChange={setAutocompleteText}
    >
    </AutoComplete>
  );
};

export default ReferenceListAutocomplete;
