import { Empty, Select, SelectProps, Spin, Typography } from 'antd';
import React, { ReactNode, useEffect, useMemo, useRef, useState, FC } from 'react';
import { useGet } from '@/hooks';
import { useDebouncedCallback } from 'use-debounce';
import { GENERIC_ENTITIES_ENDPOINT, LEGACY_ITEMS_MODULE_NAME } from '@/shesha-constants';
import { IAbpWrappedGetEntityListResponse, IGenericGetAllPayload } from '@/interfaces/gql';
import HelpTextPopover from '@/components/helpTextPopover';
import { ConfigurableItemFullName, isEntityMetadata } from '@/interfaces';
import { MetadataProvider, useMetadata } from '@/providers';
import { StandardEntityActions } from '@/interfaces/metadata';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { isDefined } from '@/utils/nullables';

interface EditorProps<TValue> {
  value?: TValue | undefined;
  onChange: ((value: TValue | null) => void) | undefined;
}

type SingleEditorProps<TValue = ConfigurableItemFullName> = {
  mode?: 'single' | undefined;
} & EditorProps<TValue>;
type MultipleEditorProps<TValue = ConfigurableItemFullName> = {
  mode: 'multiple';
} & EditorProps<TValue[]>;
export type StandardAutocompleteProps = {
  entityType: string;
  readOnly?: boolean | undefined;
  maxResultCount?: number | undefined;
  filter?: object | undefined;
  size?: SizeType | undefined;
};
type EditorWithMode<TValue> = SingleEditorProps<TValue> | MultipleEditorProps<TValue>;

export type ConfigurableItemAutocompleteRuntimeProps<TValue = ConfigurableItemFullName, TProps = StandardAutocompleteProps> = EditorWithMode<TValue> & TProps;

const isMultipleEditor = <TValue = unknown>(editor: EditorWithMode<TValue>): editor is MultipleEditorProps<TValue> => {
  return editor.mode === 'multiple';
};

type OnChangeHandler = Required<SelectProps<string | string[]>>["onChange"];

interface IOption<TData = ConfigurableItemFullName> {
  label: string | ReactNode;
  value: string;
  rawValue: TData | undefined;
  optionData: TData & {
    label?: string | undefined;
    description?: string | undefined;
  } | undefined;
  options?: IOption[] | undefined;
}

const moduleNotEmpty = { "!=": [{ var: "module" }, null] };
const moduleIsEnabled = { "==": [{ var: "module.isEnabled" }, true] };
const moduleNotDeleted = { "==": [{ var: "module.isDeleted" }, false] };
const notExposedFilter = { "==": [{ var: "isExposed" }, false] };

const getFilter = (term: string, staticFilter?: object): string => {
  const termFilter = term
    ? {
      or: [
        { in: [term, { var: 'name' }] },
        { in: [term, { var: 'module.name' }] },
      ],
    }
    : undefined;
  const allFilters = [moduleNotEmpty, moduleIsEnabled, moduleNotDeleted, notExposedFilter, termFilter, staticFilter].filter((f) => Boolean(f));
  const filter = allFilters.length === 0
    ? undefined
    : allFilters.length === 1
      ? allFilters[0]
      : { and: allFilters };

  return JSON.stringify(filter);
};

const ITEM_CONFIG_PROPERTIES = 'id name module { id name } label description';

export const itemIdsEqual = (left: ConfigurableItemFullName | undefined, right: ConfigurableItemFullName | undefined): boolean => {
  return (!isDefined(left) && !isDefined(right)) ||
    (isDefined(left) && isDefined(right) && left.module === right.module && left.name === right.name);
};

const getListFetcherQueryParams = (entityType: string, term: string, maxResultCount?: number, staticFilter?: object): IGenericGetAllPayload => {
  return {
    skipCount: 0,
    maxResultCount: maxResultCount ?? 10,
    entityType: entityType,
    properties: ITEM_CONFIG_PROPERTIES,
    quickSearch: undefined,
    filter: getFilter(term, staticFilter),
    sorting: 'module.name, name',
  };
};

interface IResponseItem {
  id: string;
  name: string;
  label?: string | undefined;
  description?: string | undefined;
  versionNo?: number | undefined;
  module?: {
    id: string;
    name: string;
  } | undefined;
}

interface IConfigurationItemProps {
  name: string;
  label?: string | undefined;
  description?: string | undefined;
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

const identifierToString = <TValue extends ConfigurableItemFullName = ConfigurableItemFullName>(id: TValue | undefined): string | undefined => {
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

const getDisplayText = (item: IResponseItem | undefined): string | null => {
  return item
    ? item.module
      ? `${item.module.name}: ${item.name}`
      : item.name
    : null;
};

export const GenericConfigurableItemAutocompleteInternal = <TValue extends ConfigurableItemFullName = ConfigurableItemFullName>(props: ConfigurableItemAutocompleteRuntimeProps<TValue>): React.JSX.Element => {
  const selectedValue = useRef<ConfigurableItemFullName>(null);
  const [autocompleteText, setAutocompleteText] = useState<string>("");
  const {
    maxResultCount = 10,
    entityType,
    mode = 'single',
    value,
    onChange,
    filter,
    size,
  } = props;

  const { metadata } = useMetadata();
  const endpoints = isEntityMetadata(metadata) ? metadata.apiEndpoints : {};
  const listEndpoint = endpoints[StandardEntityActions.list] ?? { httpVerb: 'get', url: `${GENERIC_ENTITIES_ENDPOINT}/GetAll` };

  const listFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, unknown, IGenericGetAllPayload>(
    listEndpoint.url,
    {
      lazy: true,
      queryParams: getListFetcherQueryParams(entityType, "", maxResultCount, filter),
    },
  );

  const valueFetcher = useGet<IAbpWrappedGetEntityListResponse<IResponseItem>, unknown, IGenericGetAllPayload>(
    listEndpoint.url,
    {
      lazy: true,
    },
  );
  useEffect(() => {
    if (valueFetcher.data?.success && valueFetcher.data.result) {
      const items = valueFetcher.data.result.items;
      if (items.length === 1) {
        const displayText = getDisplayText(items[0]);
        setAutocompleteText(displayText ?? "");
      } else
        console.error(items.length > 1 ? "Found more than one item with specified name" : "Item not found");
    }
  }, [valueFetcher.data?.result, valueFetcher.data?.success]);

  const listItems = listFetcher.data?.result?.items;
  const valueItems = valueFetcher.data?.result?.items;

  const fetchedItems = useMemo<IResponseItem[] | undefined>(() => {
    return listItems
      ? listItems
      : valueItems;
  }, [listItems, valueItems]);

  const fetchedOptions = useMemo<IOption[] | undefined>(() => {
    if (fetchedItems) {
      const result: IOption[] = [];
      fetchedItems.forEach((item) => {
        const moduleDto = item.module ?? { name: LEGACY_ITEMS_MODULE_NAME, id: '-' };

        const opt: IOption = {
          label: getItemValue(item),
          value: getItemValue(item),
          rawValue: {
            name: item.name,
            module: item.module?.name ?? null,
          },
          optionData: {
            name: item.name,
            module: item.module?.name ?? null,
            label: item.label,
            description: item.description,
          },
        };
        let group = result.find((g) => g.value === moduleDto.id);
        if (!group) {
          group = {
            label: moduleDto.name,
            value: moduleDto.id,
            optionData: undefined,
            rawValue: undefined,
            options: [opt],
          };
          result.push(group);
        } else {
          group.options = group.options ?? [];
          group.options.push(opt);
        }
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
        return values.map<IOption>((v) => ({
          label: identifierToString<TValue>(v),
          value: identifierToString(v) ?? "",
          rawValue: v,
          optionData: undefined,
        }));
      }
    }
    return [];
  }, [fetchedOptions, value]);

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    (localValue) => {
      void listFetcher.refetch({ queryParams: getListFetcherQueryParams(entityType, localValue, maxResultCount, filter) });
    },
    // delay in ms
    100,
  );


  const onSearch = (term: string): void => {
    debouncedFetchItems(term);
  };
  const onFocus = (): void => {
    if (!listFetcher.loading && !listFetcher.data) {
      debouncedFetchItems(autocompleteText);
    }
  };

  const onSelect: OnChangeHandler = (_value, option): void => {
    setAutocompleteText("");

    if (!Boolean(onChange)) return;
    const selectedValue = Boolean(option)
      ? Array.isArray(option)
        ? (option as IOption<TValue>[]).map((o) => o.rawValue)
        : (option as IOption<TValue>).rawValue
      : undefined;

    if (isMultipleEditor(props)) {
      const newValue = Array.isArray(selectedValue)
        ? selectedValue.filter(isDefined)
        : [selectedValue].filter(isDefined);
      props.onChange?.(newValue);
    } else {
      if (!Array.isArray(selectedValue))
        props.onChange?.(selectedValue ?? null);
    }
  };

  const onClear = (): void => {
    selectedValue.current = null;
    props.onChange?.(null);
  };

  const loading = listFetcher.loading;

  const selectValue = useMemo<string | string[]>(() => {
    return Array.isArray(value)
      ? value.map((v) => identifierToString(v)).filter(isDefined)
      : identifierToString(value) ?? "";
  }, [value]);

  return (
    <Select<string | string[], IOption>
      allowClear
      notFoundContent={loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
      style={{ width: '100%' }}
      options={options}
      showSearch={{
        onSearch: onSearch,
      }}
      onFocus={onFocus}
      onChange={onSelect}
      onClear={onClear}
      placeholder={valueFetcher.loading ? 'Loading...' : 'Type to search'}
      disabled={valueFetcher.loading || props.readOnly === true}
      value={selectValue}
      size={size}
      {...(mode === "multiple" ? { mode: "multiple" } : {})}
      optionRender={(option) => {
        const { data, value } = option;
        const { optionData } = data;
        return isDefined(optionData)
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
