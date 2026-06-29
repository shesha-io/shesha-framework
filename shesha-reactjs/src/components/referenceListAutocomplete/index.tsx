import HelpTextPopover from '@/components/helpTextPopover';
import { extractAjaxResponse, IAjaxResponse, IErrorInfo } from '@/interfaces';
import { GetAllResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useHttpClient } from '@/providers';
import { GENERIC_ENTITIES_ENDPOINT, LEGACY_REFERENCE_LISTS_MODULE_NAME } from '@/shesha-constants';
import { buildUrl } from '@/utils';
import { isNonEmptyArray } from '@/utils/array';
import { makeErrorWithMessage } from '@/utils/errors';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { AutoComplete, Empty, Spin, Typography } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import React, { ComponentProps, Dispatch, FC, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export interface IReferenceListAutocompleteRuntimeProps {
  value?: IReferenceListIdentifier | null | undefined;
  onChange?: ((value: IReferenceListIdentifier | null) => void) | undefined;
  readOnly?: boolean | undefined;
  maxResultCount?: number | undefined;
  size?: SizeType | undefined;
}

interface IOption {
  label: string | ReactNode;
  value: string;
  data: IReferenceListIdentifier | null;
  options?: IOption[] | undefined;
}

const baseItemFilter: JsonLogicFilter[] = [
];

const moduleNotEmpty = {
  "!=": [
    {
      var: "module",
    },
    null,
  ],
};
const moduleNotDisable = {
  "==": [
    {
      var: "module.isEnabled",
    },
    true,
  ],
};
const notExposedFilter = {
  "!=": [
    {
      var: "isExposed",
    },
    true,
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

  const allFilters = [moduleNotEmpty, notExposedFilter, moduleNotDisable, termFilter].filter((f) => Boolean(f));
  const filter = allFilters.length === 0
    ? undefined
    : allFilters.length === 1
      ? allFilters[0]
      : { and: allFilters };

  return JSON.stringify(filter);
};
const REFERENCE_LIST_ENTITY_TYPE = 'Shesha.Framework.ReferenceList';
const REFERENCE_LIST_PROPERTIES = 'id name module { id name } label description';
const getListFetcherQueryParams = (term: string, maxResultCount: number | undefined): IGenericGetAllPayload => {
  return {
    skipCount: 0,
    maxResultCount: maxResultCount ?? 10,
    entityType: REFERENCE_LIST_ENTITY_TYPE,
    properties: REFERENCE_LIST_PROPERTIES,
    quickSearch: undefined,
    filter: getFilter(term),
    sorting: 'module.name, name',
  };
};
const getSelectedValueQueryParams = (value: IReferenceListIdentifier | null): IGenericGetAllPayload | null => {
  if (!value)
    return null;

  const filters = [
    ...baseItemFilter,
    { '==': [{ var: 'name' }, value.name] },
  ];
  if (isDefined(value.module))
    filters.push({ '==': [{ var: 'module.name' }, value.module] });

  const expression = { and: filters };

  return {
    skipCount: 0,
    maxResultCount: 1000,
    entityType: REFERENCE_LIST_ENTITY_TYPE,
    properties: REFERENCE_LIST_PROPERTIES,
    filter: JSON.stringify(expression),
  };
};

interface IResponseItem {
  id: string;
  name: string;
  module?: {
    id: string;
    name: string;
  } | undefined;
  label?: string | undefined;
  description?: string | undefined;
};

interface IConfigurationItemProps {
  name: string;
  label?: string | undefined;
  description?: string | undefined;
}

const RefListLabel: FC<IConfigurationItemProps> = ({ name, description, label }) => {
  const displayLabel = !isNullOrWhiteSpace(label) && label !== name
    ? label
    : null;
  return (
    <div>
      <HelpTextPopover content={description}>
        <span>{name}</span>
      </HelpTextPopover>
      {!isNullOrWhiteSpace(displayLabel) && (
        <><br /><Typography.Text type="secondary" ellipsis={true}>{displayLabel}</Typography.Text></>
      )}
    </div>
  );
};

const getDisplayText = (item: IResponseItem | undefined): string => {
  if (!item)
    return "";
  const fullName = item.name;

  return item.module
    ? `${item.module.name}:${fullName}`
    : fullName;
};

type OnSelectHandler = ComponentProps<typeof AutoComplete>["onSelect"];

type DataWithLoadingState<TData> = {
  data: TData | undefined;
  error?: IErrorInfo | undefined;
  loading: boolean;
};

const useDataWithLoadingState = <TData = unknown>(): [DataWithLoadingState<TData>, Dispatch<SetStateAction<DataWithLoadingState<TData>>>] => {
  return useState<DataWithLoadingState<TData>>(() => ({ data: undefined, loading: false }));
};

export const ReferenceListAutocomplete: FC<IReferenceListAutocompleteRuntimeProps> = (props) => {
  const selectedValue = useRef<IReferenceListIdentifier | null>(null);
  const [autocompleteText, setAutocompleteText] = useState<string>("");
  const {
    readOnly = false,
    maxResultCount = 10,
  } = props;

  const httpClient = useHttpClient();
  const [listItems, setListItems] = useDataWithLoadingState<IResponseItem[]>();
  const [valueItems, setValueItems] = useDataWithLoadingState<IResponseItem[]>();

  const fetchedItems = useMemo<IResponseItem[] | undefined>(() => {
    return listItems.data
      ? listItems.data
      : valueItems.data;
  }, [listItems, valueItems]);

  useEffect(() => {
    // fetch data if required
    const valueFetchParams = getSelectedValueQueryParams(props.value ?? null);
    if (valueFetchParams) {
      const selectedFromList = isDefined(selectedValue.current) && selectedValue.current === props.value;
      if (!selectedFromList) {
        const fetchValueAsync = async (): Promise<void> => {
          setValueItems((s) => ({ ...s, loading: true }));
          try {
            const url = buildUrl(`${GENERIC_ENTITIES_ENDPOINT}/GetAll`, valueFetchParams);
            const response = await httpClient.get<IAjaxResponse<GetAllResponse<IResponseItem>>>(url);
            const responseData = extractAjaxResponse(response.data, 'Failed to fetch items');
            setValueItems((s) => ({ ...s, loading: false, error: undefined, data: responseData.items }));

            const items = responseData.items;
            if (isNonEmptyArray(items) && items.length === 1) {
              const displayText = getDisplayText(items[0]);
              setAutocompleteText(displayText);
            } else
              console.error(items.length > 1 ? "Found more than one form with specified name" : "Reference list not found");
          } catch (e) {
            setValueItems((s) => ({
              ...s,
              data: undefined,
              loading: false,
              error: makeErrorWithMessage(e, "Failed to fetch items"),
            }));
          }
        };

        void fetchValueAsync();
      }
    }
  }, [httpClient, props.value, setValueItems]);

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
            module: item.module?.name ?? null,
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
        } else {
          group.options = group.options ?? [];
          group.options.push(opt);
        }
      });
    }

    return result;
  }, [fetchedItems]);

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    async (localValue) => {
      setListItems((s) => ({ ...s, loading: true }));
      try {
        const url = buildUrl(`${GENERIC_ENTITIES_ENDPOINT}/GetAll`, getListFetcherQueryParams(localValue, maxResultCount));
        const response = await httpClient.get<IAjaxResponse<GetAllResponse<IResponseItem>>>(url);
        const responseData = extractAjaxResponse(response.data, 'Failed to fetch items');
        setListItems((s) => ({ ...s, loading: false, error: undefined, data: responseData.items }));
      } catch (e) {
        setListItems((s) => ({
          ...s,
          data: undefined,
          loading: false,
          error: makeErrorWithMessage(e, "Failed to fetch items"),
        }));
      }
    },
    // delay in ms
    100,
  );


  const onSearch = (term: string): void => {
    debouncedFetchItems(term);
  };

  const onSelect: OnSelectHandler = (_value, option) => {
    const listId = (option as IOption).data;
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

  return (
    <AutoComplete
      allowClear
      notFoundContent={listItems.loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
      style={{ width: '100%' }}
      options={options}
      showSearch={{
        onSearch: onSearch,
      }}
      onSelect={onSelect}
      onClear={onClear}
      placeholder={valueItems.loading ? 'Loading...' : 'Type to search'}
      disabled={valueItems.loading || readOnly}
      size={props.size}
      value={autocompleteText}
      onChange={setAutocompleteText}
    >
    </AutoComplete>
  );
};

export default ReferenceListAutocomplete;
