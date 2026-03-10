import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { ConfigurableItemFullName } from '@/interfaces';
import { Empty, Select, Spin, Typography } from 'antd';
import { useGet } from '@/hooks';
import { AbpWrappedResponse } from '@/interfaces/gql';
import { useDebouncedCallback } from 'use-debounce';
import HelpTextPopover from '../helpTextPopover';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { getEntityTypeName } from '@/providers/metadataDispatcher/entities/utils';

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
  rawValue: ConfigurableItemFullName;
  optionData: IMetadataAutocompleteDto;
  options?: IOption[];
}

export type EntityIdentifier = ConfigurableItemFullName | string;

export type EntityTypeAutocompleteType = 'All' | 'Entity' | 'JsonEntity';

interface IEntityTypeAutocompleteProps {
  value?: EntityIdentifier;
  baseModel?: EntityIdentifier;
  readOnly?: boolean;
  onChange?: (value: EntityIdentifier | null) => void;
  type?: EntityTypeAutocompleteType;
  size?: SizeType;
}

interface ISelectedItem {
  value?: EntityIdentifier;
  key?: string;
  item?: IMetadataAutocompleteDto;
}

interface IEntityTypeAutocompletePayload {
  type?: EntityTypeAutocompleteType;
  term?: string;
  selectedValue?: string;
  baseModel?: EntityIdentifier;
}

const isEntityByEntityId = (item: IMetadataAutocompleteDto, id: EntityIdentifier): Boolean => {
  return typeof id === 'string'
    ? `${item.className}` === id || `${item.alias}` === id
    : item.module === id.module && item.name === id.name;
};

const getDisplayText = (item: IMetadataAutocompleteDto): string | null => item ? getEntityTypeName(item) : null;
const getEntityIdentifier = (item: ConfigurableItemFullName): string | null => item ? getEntityTypeName(item) : null;

const getListFetcherQueryParams = (
  type: EntityTypeAutocompleteType,
  term: string | null,
  value: EntityIdentifier | null,
  baseModel?: EntityIdentifier,
): IEntityTypeAutocompletePayload => {
  return {
    type: type ?? 'All',
    term: term ?? undefined,
    selectedValue: typeof value === 'string'
      ? value
      : value?.module && value?.name
        ? getEntityIdentifier(value)
        : undefined,
    baseModel: typeof baseModel === 'string'
      ? baseModel
      : baseModel?.module && baseModel?.name
        ? getEntityIdentifier(baseModel)
        : undefined,
  };
};

export const EntityTypeAutocomplete: FC<IEntityTypeAutocompleteProps> = (props) => {
  const {
    value,
    readOnly,
    size,
    onChange,
    type = 'All',
    baseModel,
  } = props;

  const [selectedItem, setSelectedItem] = useState<ISelectedItem>({});

  const listFetcher = useGet<AbpWrappedResponse<IMetadataAutocompleteDto[], any>, any, IEntityTypeAutocompletePayload>(
    '/api/services/app/Metadata/Autocomplete',
    { lazy: true, queryParams: getListFetcherQueryParams(type, '', null, baseModel) },
  );

  const fetchedItems = listFetcher.data?.result;

  const debouncedFetchItems = useDebouncedCallback<(term?: string) => void>(
    (term?: string) => {
      listFetcher.refetch({ queryParams: getListFetcherQueryParams(type, term, selectedItem.value ?? value, baseModel) });
    },
    // delay in ms
    100,
  );

  useEffect(() => {
    // If value exists and has changed
    if (Boolean(value) && value !== selectedItem.value) {
      // try to find in the fetched items
      const foundItem = fetchedItems?.find((item) => isEntityByEntityId(item, value));
      if (foundItem) {
        // set the selected item
        setSelectedItem({ value: value, key: getDisplayText(foundItem), item: foundItem });
      } else {
        // fetch the item
        debouncedFetchItems();
      }
    }
  }, [value]);

  useEffect(() => {
    // If value exists and has changed
    if (Boolean(value) && value !== selectedItem.value) {
      // try to find in the fetched items
      const foundItem = fetchedItems?.find((item) => isEntityByEntityId(item, value));
      if (foundItem) {
        // set the selected item
        setSelectedItem({ value: value, key: getDisplayText(foundItem), item: foundItem });
      }
    }
  }, [listFetcher.data?.result]);

  const onSearch = (term): void => {
    debouncedFetchItems(term);
  };

  const onSelect = (_value, option: IOption): void => {
    if (!Boolean(onChange)) return;
    const selectedValue = Boolean(option) ? option.rawValue : undefined;
    onChange(selectedValue);
  };

  const onClear = (): void => {
    setSelectedItem({});
    if (props.onChange) {
      props.onChange(null);
    }
  };

  const onFocus = (): void => {
    debouncedFetchItems();
  };

  const fetchedOptions = useMemo<IOption[]>(() => {
    if (fetchedItems) {
      const result: IOption[] = [];
      fetchedItems.forEach((item) => {
        const module = item.module ?? '[no-module]';

        const opt: IOption = {
          label: getDisplayText(item),
          value: getDisplayText(item),
          rawValue: {
            name: item.name,
            module: item.module,
          },
          optionData: {
            id: item.id,
            name: item.name,
            className: item.className,
            module: item.module,
            description: item.description,
          },
        };
        let group = result.find((g) => g.value === module);
        if (!group) {
          group = {
            label: module,
            value: module,
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
    return [];
  }, [fetchedItems]);

  const loading = listFetcher.loading;
  const loadingInitialItem = loading && Boolean(value) && !selectedItem;

  return (
    <Select<string, IOption>
      allowClear
      notFoundContent={loading ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No matches" />}
      style={{ width: '100%' }}
      options={fetchedOptions}
      showSearch={true}
      onSearch={onSearch}
      onChange={onSelect}
      onFocus={onFocus}
      onClear={onClear}
      placeholder={loadingInitialItem ? 'Loading...' : 'Type to search'}
      disabled={loadingInitialItem || readOnly}
      value={selectedItem?.key ??
        (typeof value === 'string'
          ? value
          : (value ? getEntityIdentifier(value as ConfigurableItemFullName) ?? undefined : undefined))}
      size={size}

      optionRender={(option) => {
        const { data, value } = option;
        const optionData = data.optionData as IMetadataAutocompleteDto;
        return optionData
          ? (
            <ItemLabel
              name={optionData.name}
              label={optionData.name}
              description={optionData.description}
            />
          )
          : <>{value}</>;
      }}
    />
  );
};

export default EntityTypeAutocomplete;
