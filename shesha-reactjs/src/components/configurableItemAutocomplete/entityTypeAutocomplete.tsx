import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { ConfigurableItemFullName } from '@/interfaces';
import { Empty, Select, SelectProps, Spin, Typography } from 'antd';
import { useGet } from '@/hooks';
import { AbpWrappedResponse } from '@/interfaces/gql';
import { useDebouncedCallback } from 'use-debounce';
import HelpTextPopover from '../helpTextPopover';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { getEntityTypeName, isEntityTypeIdEqual } from '@/providers/metadataDispatcher/entities/utils';
import { isDefined } from '@/utils/nullables';

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

interface IMetadataAutocompleteDto
{
  id: string;
  name: string;
  description?: string | null;
  module: string | null;
  className: string;
  alias?: string | null;
}

interface IOption {
  label: string | ReactNode;
  value: string;
  rawValue: ConfigurableItemFullName | undefined;
  optionData: IMetadataAutocompleteDto | undefined;
  options?: IOption[];
}

export type EntityIdentifier = ConfigurableItemFullName | string;

export type EntityTypeAutocompleteType = 'All' | 'Entity' | 'JsonEntity';

interface IEntityTypeAutocompleteProps {
  value?: EntityIdentifier | undefined;
  placeholder?: string | undefined;
  baseModel?: EntityIdentifier | undefined;
  readOnly?: boolean | undefined;
  onChange?: ((value: EntityIdentifier | null) => void) | undefined;
  onFocus?: () => void | undefined;
  type?: EntityTypeAutocompleteType | undefined;
  size?: SizeType | undefined;
}

interface ISelectedItem {
  value?: EntityIdentifier | undefined;
  key?: string | undefined;
  item?: IMetadataAutocompleteDto | undefined;
}

interface IEntityTypeAutocompletePayload {
  type?: EntityTypeAutocompleteType | undefined;
  term?: string | undefined;
  selectedValue?: string | undefined;
  baseModel?: EntityIdentifier | undefined;
}

const isEntityByEntityId = (item: IMetadataAutocompleteDto, id: EntityIdentifier): boolean => {
  return typeof id === 'string'
    ? `${item.className}` === id || `${item.alias}` === id
    : item.module === id.module && item.name === id.name;
};

const getDisplayText = (item: IMetadataAutocompleteDto): string | undefined => getEntityTypeName(item);
const getEntityIdentifier = (item: ConfigurableItemFullName): string | undefined => getEntityTypeName(item);

const getListFetcherQueryParams = (
  type: EntityTypeAutocompleteType,
  term: string | undefined,
  value: EntityIdentifier | undefined,
  baseModel?: EntityIdentifier,
): IEntityTypeAutocompletePayload => {
  return {
    type: type ?? 'All',
    term: term,
    selectedValue: typeof value === 'string'
      ? value
      : value?.name
        ? getEntityIdentifier(value)
        : undefined,
    baseModel: typeof baseModel === 'string'
      ? baseModel
      : baseModel?.name
        ? getEntityIdentifier(baseModel)
        : undefined,
  };
};

type OnChangeHandler = Required<SelectProps<string, IOption>>["onChange"];

export const EntityTypeAutocomplete: FC<IEntityTypeAutocompleteProps> = (props) => {
  const {
    value,
    placeholder,
    readOnly,
    size,
    onChange,
    onFocus,
    type = 'All',
    baseModel,
  } = props;

  const [selectedItem, setSelectedItem] = useState<ISelectedItem>({});

  const listFetcher = useGet<AbpWrappedResponse<IMetadataAutocompleteDto[]>, unknown, IEntityTypeAutocompletePayload>(
    '/api/services/app/Metadata/Autocomplete',
    { lazy: true, queryParams: getListFetcherQueryParams(type, '', undefined, baseModel) },
  );

  const fetchedItems = listFetcher.data?.result;

  const debouncedFetchItems = useDebouncedCallback<(term?: string) => void>(
    (term?: string) => {
      listFetcher.refetch({ queryParams: getListFetcherQueryParams(type, term, selectedItem.value ?? value, baseModel) })
        .catch((error) => {
          console.error('Failed to init form', error);
          throw error;
        });
    },
    // delay in ms
    100,
  );

  useEffect(() => {
    if (isDefined(value) && (!isDefined(selectedItem.value) || !isEntityTypeIdEqual(value, selectedItem.value))) {
      // try to find in the fetched items
      const foundItem = fetchedItems?.find((item) => isEntityByEntityId(item, value));
      if (foundItem) {
        // set the selected item
        setSelectedItem({ value: value, key: getDisplayText(foundItem) ?? "", item: foundItem });
      } else {
        setSelectedItem({});
        // Fetch directly with the new value to avoid selectedItem.value being stale in debouncedFetchItems
        listFetcher
          .refetch({ queryParams: getListFetcherQueryParams(type, undefined, value, baseModel) })
          .catch((error) => {
            console.error('Failed to fetch entity type', error);
            throw error;
          });
      }
    }
    // TODO V1: review after removal of useGet
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, type, baseModel]);

  useEffect(() => {
    if (isDefined(value) && (!isDefined(selectedItem.value) || !isEntityTypeIdEqual(value, selectedItem.value))) {
      // try to find in the fetched items
      const foundItem = fetchedItems?.find((item) => isEntityByEntityId(item, value));
      if (foundItem) {
        // set the selected item
        setSelectedItem({ value: value, key: getDisplayText(foundItem), item: foundItem });
      }
    }
    // TODO V1: review after removal of useGet
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listFetcher.data?.result]);

  const onSearch = (term?: string): void => {
    debouncedFetchItems(term);
  };

  const onSelect: OnChangeHandler = (_value, option) => {
    if (!isDefined(onChange)) return;
    if (Array.isArray(option)) return;
    const selectedValue = isDefined(option) ? option.rawValue : undefined;
    if (selectedValue && option?.optionData) {
      setSelectedItem({
        value: selectedValue,
        key: getDisplayText(option.optionData),
        item: option.optionData,
      });
    }
    onChange(selectedValue ?? null);
  };

  const onClear = (): void => {
    setSelectedItem({});
    if (props.onChange) {
      props.onChange(null);
    }
  };

  const onFocusHandler = (): void => {
    debouncedFetchItems();
    onFocus?.();
  };

  const fetchedOptions = useMemo<IOption[]>(() => {
    if (fetchedItems) {
      const result: IOption[] = [];
      fetchedItems.forEach((item) => {
        const module = item.module ?? '[no-module]';

        const opt: IOption = {
          label: getDisplayText(item),
          value: getDisplayText(item) ?? "",
          rawValue: {
            name: item.name,
            module: item.module,
          },
          optionData: {
            id: item.id,
            name: item.name,
            className: item.className,
            module: item.module,
            description: item.description ?? null,
          },
        };
        let group = result.find((g) => g.value === module);
        if (!group) {
          group = {
            label: module,
            value: module,
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
    return [];
  }, [fetchedItems]);

  const loading = listFetcher.loading;
  const loadingInitialItem = loading && Boolean(value) && !selectedItem.key;

  return (
    <Select<string, IOption>
      allowClear
      notFoundContent={loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
      style={{ width: '100%' }}
      options={fetchedOptions}
      showSearch={{ onSearch: onSearch, filterOption: false }}
      onChange={onSelect}
      onFocus={onFocusHandler}
      onClear={onClear}
      placeholder={loadingInitialItem ? 'Loading...' : placeholder ?? 'Type to search'}
      disabled={(loadingInitialItem || readOnly) ?? false}
      value={selectedItem.key ??
        (typeof value === 'string'
          ? value
          : (value ? getEntityIdentifier(value) ?? null : null))}
      size={size}

      optionRender={(option) => {
        const { data, value } = option;
        const optionData = data.optionData;
        return optionData
          ? (
            <ItemLabel
              name={optionData.name}
              label={optionData.name}
              description={optionData.description ?? undefined}
            />
          )
          : <>{value}</>;
      }}
    />
  );
};

export default EntityTypeAutocomplete;
