import { Empty, Select, Spin, Typography } from 'antd';
import React, { ReactNode, useEffect, useMemo, useRef, useState, FC } from 'react';

import { useGet } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { GENERIC_ENTITIES_ENDPOINT, LEGACY_ITEMS_MODULE_NAME } from '@/shesha-constants';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import HelpTextPopover from '@/components/helpTextPopover';
import { ConfigurableItemFullName, ConfigurableItemIdentifier, isConfigurableItemFullName, isConfigurableItemRawId, isEntityMetadata } from '@/interfaces';
import { MetadataProvider, useMetadata } from '@/providers';
import { StandardEntityActions } from '@/interfaces/metadata';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

interface EditorProps<TValue> {
  value?: TValue;
  onChange?: (value?: TValue) => void;
}

type SingleEditorProps<TValue = ConfigurableItemFullName> = { mode?: 'single' | undefined } & EditorProps<TValue>;
type MultipleEditorProps<TValue = ConfigurableItemFullName> = { mode: 'multiple' } & EditorProps<TValue[]>;
export type StandardAutocompleteProps = {
  entityType: string;
  readOnly?: boolean;
  maxResultCount?: number;
  filter?: object;
  size?: SizeType;
};
type EditorWithMode<TValue> = SingleEditorProps<TValue> | MultipleEditorProps<TValue>;

export type ConfigurableItemAutocompleteRuntimeProps<TValue = ConfigurableItemFullName, TProps = StandardAutocompleteProps> = EditorWithMode<TValue> & TProps;

const isMultipleEditor = <TValue = unknown>(editor: EditorWithMode<TValue>): editor is MultipleEditorProps<TValue> => {
  return editor.mode === 'multiple';
};

interface IOption<TData = ConfigurableItemFullName> {
  label: string | ReactNode;
  value: string;
  rawValue: TData;
  optionData: TData & {
    label?: string;
    description?: string;
  };
  options?: IOption[];
}

const baseItemFilter = undefined;

const baseListFilter = {
  "!=": [
    {
      var: "module",
    },
    null,
  ],
};

const getFilter = (term: string, staticFilter?: object): string => {
  const termFilter = term
    ? {
      or: [
        { in: [term, { var: 'name' }] },
        { in: [term, { var: 'module.name' }] },
      ],
    }
    : undefined;
  const allFilters = [baseListFilter, termFilter, staticFilter].filter((f) => Boolean(f));
  const filter = allFilters.length === 0
    ? undefined
    : allFilters.length === 1
      ? allFilters[0]
      : { and: allFilters };

  return JSON.stringify(filter);
};

const ITEM_CONFIG_PROPERTIES = 'id name module { id name } label description';

export const itemIdsEqual = (left: ConfigurableItemFullName, right: ConfigurableItemFullName): Boolean => {
  return (!left && !right) ||
    (left && right && left.module === right.module && left.name === right.name);
};

const getListFetcherQueryParams = (entityType: string, term: string, maxResultCount?: number, staticFilter?: object): IGenericGetAllPayload => {
  return {
    skipCount: 0,
    maxResultCount: maxResultCount ?? 10,
    entityType: entityType,
    properties: ITEM_CONFIG_PROPERTIES,
    quickSearch: null,
    filter: getFilter(term, staticFilter),
    sorting: 'module.name, name',
  };
};
export const getSelectedValueQueryParams = (entityType: string, value?: ConfigurableItemIdentifier): IGenericGetAllPayload => {
  if (!value)
    return null;

  const expression = isConfigurableItemRawId(value)
    ? { '==': [{ var: 'id' }, value] }
    : isConfigurableItemFullName(value)
      ? {
        and: [
          baseItemFilter,
          { '==': [{ var: 'name' }, value.name] },
          { '==': [{ var: 'module.name' }, value.module] },
        ],
      }
      : null;

  return expression
    ? {
      skipCount: 0,
      maxResultCount: 1000,
      entityType: entityType,
      properties: ITEM_CONFIG_PROPERTIES,
      filter: JSON.stringify(expression),
    }
    : null;
};

interface IResponseItem {
  id: string;
  name: string;
  label?: string;
  description?: string;
  versionNo?: number;
  module?: {
    id: string;
    name: string;
  };
}

interface IConfigurationItemProps {
  name: string;
  label?: string;
  description?: string;
}

const ItemLabel: FC<IConfigurationItemProps> = ({ name, description, label }) => {
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

const identifierToString = <TValue extends ConfigurableItemFullName = ConfigurableItemFullName>(id: TValue): string => {
  return id
    ? id.module
      ? `${id.module}:${id.name}`
      : id.name
    : undefined;
};

const getItemValue = (item: IResponseItem): string => {
  return item.module
    ? `${item.module.name}:${item.name}`
    : item.name;
};

const getDisplayText = (item: IResponseItem): string | null => {
  return item
    ? item.module
      ? `${item.module.name}: ${item.name}`
      : item.name
    : null;
};

export const GenericConfigurableItemAutocompleteInternal = <TValue extends ConfigurableItemFullName = ConfigurableItemFullName>(props: ConfigurableItemAutocompleteRuntimeProps<TValue>): JSX.Element => {
  const selectedValue = useRef<ConfigurableItemFullName>(null);
  const [autocompleteText, setAutocompleteText] = useState<string>(null);
  const {
    maxResultCount = 10,
    entityType,
    mode = 'single',
    value,
    onChange,
    filter,
    size,
  } = props;

  const { metadata } = useMetadata(true);
  const endpoints = isEntityMetadata(metadata) ? metadata.apiEndpoints : {};
  const listEndpoint = endpoints[StandardEntityActions.list] ?? { httpVerb: 'get', url: `${GENERIC_ENTITIES_ENDPOINT}/GetAll` };

  const listFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, any, IGenericGetAllPayload>(
    listEndpoint.url,
    {
      lazy: true,
      queryParams: getListFetcherQueryParams(entityType, null, maxResultCount, filter),
    },
  );

  const valueFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, any, IGenericGetAllPayload>(
    listEndpoint.url,
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
        console.error(items.length > 1 ? "Found more than one item with specified name" : "Item not found");
    }
  }, [valueFetcher.data?.result, valueFetcher.data?.success]);

  const listItems = listFetcher.data?.result?.items;
  const valueItems = valueFetcher.data?.result?.items;

  const fetchedItems = useMemo<IResponseItem[]>(() => {
    return listItems
      ? listItems
      : valueItems;
  }, [listItems, valueItems]);

  const fetchedOptions = useMemo<IOption[]>(() => {
    if (fetchedItems) {
      const result: IOption[] = [];
      fetchedItems.forEach((item) => {
        const moduleDto = item.module ?? { name: LEGACY_ITEMS_MODULE_NAME, id: '-' };

        const opt: IOption = {
          label: getItemValue(item),
          value: getItemValue(item),
          rawValue: {
            name: item.name,
            module: item.module?.name,
          },
          optionData: {
            name: item.name,
            module: item.module?.name,
            label: item.label,
            description: item.description,
          },
        };
        let group = result.find((g) => g.value === moduleDto.id);
        if (!group) {
          group = {
            label: moduleDto.name,
            value: moduleDto.id,
            optionData: null,
            rawValue: null,
            options: [opt],
          };
          result.push(group);
        } else
          group.options.push(opt);
      });
      return result;
    }
    return undefined;
  }, [fetchedItems]);

  const options = useMemo<IOption[]>(() => {
    if (fetchedOptions) {
      return fetchedOptions;
    } else {
      if (value) {
        const values = Array.isArray(value) ? value : [value];
        return values.map((v) => ({
          label: identifierToString<TValue>(v),
          value: identifierToString(v),
          rawValue: v,
          optionData: undefined,
        }));
      }
    }
    return [];
  }, [fetchedOptions, value]);

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    (localValue) => {
      listFetcher.refetch({ queryParams: getListFetcherQueryParams(entityType, localValue, maxResultCount, filter) });
    },
    // delay in ms
    100,
  );


  const onSearch = (term): void => {
    debouncedFetchItems(term);
  };
  const onFocus = (): void => {
    if (!listFetcher.loading && !listFetcher.data) {
      debouncedFetchItems(autocompleteText);
    }
  };


  const onSelect = (_value, option): void => {
    setAutocompleteText(null);

    if (!Boolean(onChange)) return;
    const selectedValue = Boolean(option)
      ? Array.isArray(option)
        ? (option as IOption<TValue>[]).map((o) => o.rawValue)
        : (option as IOption<TValue>).rawValue
      : undefined;

    if (isMultipleEditor(props)) {
      const newValue = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
      props.onChange(newValue);
    } else {
      if (!Array.isArray(selectedValue))
        props.onChange(selectedValue);
    }
  };

  const onClear = (): void => {
    selectedValue.current = null;
    if (props.onChange) {
      props.onChange(null);
    }
  };

  const loading = listFetcher.loading;

  const selectValue = useMemo<string | string[]>(() => {
    return Array.isArray(value)
      ? value.map((v) => identifierToString(v))
      : identifierToString(value);
  }, [value]);

  return (
    <Select<string | string[]>
      allowClear
      notFoundContent={loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
      style={{ width: '100%' }}
      options={options}
      showSearch={true}
      onFocus={onFocus}
      onSearch={onSearch}
      onChange={onSelect}
      onClear={onClear}
      placeholder={valueFetcher.loading ? 'Loading...' : 'Type to search'}
      disabled={valueFetcher.loading || props.readOnly}
      value={selectValue}
      size={size}
      mode={mode === 'multiple' ? 'multiple' : undefined}

      optionRender={(option) => {
        const { data, value } = option;
        const optionData = (data as IOption)?.optionData;
        return optionData
          ? (
            <ItemLabel
              name={optionData.name}
              label={optionData.label}
              description={optionData.description}
            />
          )
          : <>{value}</>;
      }}
    />
  );
};

export const GenericConfigItemAutocomplete: FC<ConfigurableItemAutocompleteRuntimeProps> = (props) => {
  return (
    <MetadataProvider
      modelType={props.entityType}
    >
      <GenericConfigurableItemAutocompleteInternal {...props} />
    </MetadataProvider>
  );
};
