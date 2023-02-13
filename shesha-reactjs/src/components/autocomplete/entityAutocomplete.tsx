import React, { useState, useMemo, useRef } from 'react';
import { Select, Tag } from 'antd';
import { AutocompleteItemDto } from '../../apis/autocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { useSubscribe } from '../..';
import { ReadOnlyDisplayFormItem } from './../readOnlyDisplayFormItem';
import { useEntityAutocomplete } from '../../utils/autocomplete';
import { CustomLabeledValue, IEntityAutocompleteProps, ISelectOption } from './models';

/**
 * Entity autocomplete
 */

export const EntityAutocomplete = <TValue,>(props: IEntityAutocompleteProps<TValue>) => {
  const {
    value,
    defaultValue,
    placeholder,
    typeShortAlias,
    entityDisplayProperty,
    //allowInherited,
    onChange,
    disabled,
    bordered,
    style,
    size,
    mode,
    notFoundContent,
    getOptionFromFetchedItem,
    getLabeledValue,
    readOnly,
    readOnlyMultipleMode = 'raw',
    disableSearch,
    quickviewEnabled,
    quickviewFormPath,
    quickviewDisplayPropertyName,
    quickviewGetEntityUrl,
    quickviewWidth,
    subscribedEventNames,
    filter,
  } = props;

  const rawValue = typeof value === 'string' ? value : (value as any)?.id ?? undefined;
  /* todo: uncomment and test with arrays and numbers
      : Array.isArray(value)
        ? value
        : undefined;
      */

  // todo: move part of logic to the `useEntityAutocomplete`, implement support of multiple mode (it was not supported before because of wrong loading of provided value)
  const { data: fetchedData, loading, error: fetchError, search: searchEntity } = useEntityAutocomplete({
    entityType: typeShortAlias,
    value: rawValue,
    filter,
    displayProperty: entityDisplayProperty,
  });

  const selectRef = useRef(null);

  const [autocompleteText, setAutocompleteText] = useState(null);

  useSubscribe(subscribedEventNames, () => debouncedClear(autocompleteText));

  const extractProperty = (item: object, propertyName: string): string => {
    const propName = propertyName || '_displayName';
    var path = propName.split('.')
    var result = path.reduce((val, name) => val ? val[name] : null, item);
    return result;
  }

  const getFetchedItems = (): AutocompleteItemDto[] => {
    return fetchedData.map<AutocompleteItemDto>(e => ({ value: e.id.toString(), displayText: extractProperty(e, entityDisplayProperty) }));
  };

  const handleSelect = () => {
    selectRef.current.blur();
  };

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    localValue => {
      searchEntity(localValue);
    },
    // delay in ms
    200
  );

  const debouncedClear = useDebouncedCallback(localValue => {
    searchEntity(localValue);

    if (onChange) onChange(null);
  }, 300);

  const wrapValue = (localValue: TValue | TValue[]): CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[] => {
    if (!Boolean(localValue)) return undefined;
    if (mode === 'multiple' || mode === 'tags') {
      return Array.isArray(localValue)
        ? (localValue as TValue[]).map<CustomLabeledValue<TValue>>(o => {
            return getLabeledValue(o, options);
          })
        : [getLabeledValue(localValue as TValue, options)];
    } else return getLabeledValue(localValue as TValue, options);
  };

  const options = useMemo<ISelectOption<TValue>[]>(() => {
    const localData = getFetchedItems() || [];

    const fetchedItems = localData.map<ISelectOption<TValue>>(item => {
      const option = Boolean(getOptionFromFetchedItem)
        ? (getOptionFromFetchedItem(item) as ISelectOption<TValue>)
        : (item as ISelectOption<TValue>);

      return option;
    });

    const selectedItem = wrapValue(value);

    // Remove items which are already exist in the fetched items.
    // Note: we shouldn't process full list and make it unique because by this way we'll hide duplicates received from the back-end
    const selectedItems = selectedItem
      ? (Array.isArray(selectedItem) ? selectedItem : [selectedItem]).filter(
          i => fetchedItems.findIndex(fi => fi.value === i.value) === -1
        )
      : [];

    const result = [...fetchedItems, ...selectedItems];
    return result;
  }, [value, autocompleteText, fetchedData]);

  const handleSearch = (localValue: string) => {
    setAutocompleteText(localValue);
    if (localValue) {
      debouncedFetchItems(localValue);
    }
  };

  const handleChange = (_value: CustomLabeledValue<TValue>, option: any) => {
    if (!Boolean(onChange)) return;
    const selectedValue = Boolean(option)
      ? Array.isArray(option)
        ? (option as ISelectOption<TValue>[]).map(o => o.data)
        : (option as ISelectOption<TValue>).data
      : undefined;

    if (mode === 'multiple' || mode === 'tags') {
      onChange(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
    } else onChange(selectedValue);
  };

  if (readOnly) {
    const wrappedValue = wrapValue(value);

    let displayValue: any;

    if (Array.isArray(wrappedValue)) {
      displayValue = wrappedValue?.map(({ label, value: keyId }: any) =>
        readOnlyMultipleMode === 'raw' && typeof label === 'string' ? label : <Tag key={keyId}>{label}</Tag>
      );

      if (readOnlyMultipleMode === 'raw') displayValue = (displayValue as any[])?.join(', ');
    } else {
      displayValue = (wrappedValue as any)?.label;
    }
  }

  const dataLoaded = fetchedData && fetchedData.length > 0;
  const autocompleteValue = value || dataLoaded || fetchError ? wrapValue(value) : undefined;
  const selectPlaceholder = value && !dataLoaded && loading ? 'Loading...' : placeholder ?? '';


  if (readOnly || disabled) {
    return (
      <ReadOnlyDisplayFormItem
        value={autocompleteValue}
        type={mode === 'multiple' || mode === 'tags' ? 'dropdownMultiple' : 'dropdown'}
        disabled={disabled}
        quickviewEnabled={quickviewEnabled}
        quickviewFormPath={{name: quickviewFormPath}}
        quickviewDisplayPropertyName={quickviewDisplayPropertyName}
        quickviewGetEntityUrl={quickviewGetEntityUrl}
        quickviewWidth={quickviewWidth ? Number(quickviewWidth) : null} // quick fix string value of quickviewWidth (from configurator)
      />
    );
  }

  const onFocus = () => {
    // fetch default items on focus if value is empty
    if (!autocompleteText) debouncedFetchItems(null);
  };

  return (
    <Select<CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[]>
      showSearch={!disableSearch}
      labelInValue={true}
      notFoundContent={notFoundContent}
      defaultActiveFirstOption={false}
      showArrow={true}
      filterOption={false}
      onSearch={handleSearch}
      defaultValue={wrapValue(defaultValue)}
      value={autocompleteValue}
      onChange={handleChange}
      allowClear={true}
      onFocus={onFocus}
      loading={loading}
      placeholder={selectPlaceholder}
      disabled={disabled}
      bordered={bordered}
      onSelect={handleSelect}
      style={style}
      size={size}
      ref={selectRef}
      mode={value ? mode : undefined} // When mode is multiple and value is null, the control shows an empty tag
    >
      {options?.map(({ value: localValue, label, data }) => (
        <Select.Option value={localValue} key={localValue} data={data}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
};
