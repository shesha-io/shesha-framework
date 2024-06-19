import React, { useMemo, useRef, useState } from 'react';
import {
  AutocompleteItemDto,
  CustomLabeledValue,
  IEntityAutocompleteProps,
  ISelectOption
} from './models';
import { ReadOnlyDisplayFormItem } from './../readOnlyDisplayFormItem';
import { Select } from 'antd';
import { useDebouncedCallback } from 'use-debounce';
import { useEntityAutocomplete } from '@/utils/autocomplete';
import { useSubscribe } from '@/hooks';

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
    bordered = true,
    style,
    size,
    mode,
    notFoundContent,
    getOptionFromFetchedItem,
    getLabeledValue,
    readOnly,
    //readOnlyMultipleMode = 'raw',
    disableSearch,
    quickviewEnabled,
    quickviewFormPath,
    quickviewDisplayPropertyName,
    quickviewGetEntityUrl,
    quickviewWidth,
    subscribedEventNames,
    filter,
  } = props;


  const rawValue = typeof value === 'string' || Array.isArray(value) ? value : (value as any)?.id ?? undefined;
  /* TODO: uncomment and test with arrays and numbers
      : Array.isArray(value)
        ? value
        : undefined;
      */

  // TODO: move part of logic to the `useEntityAutocomplete`, implement support of multiple mode (it was not supported before because of wrong loading of provided value)
  const {
    data: fetchedData,
    loading,
    error: fetchError,
    search: searchEntity,
  } = useEntityAutocomplete({
    entityType: typeShortAlias,
    value: rawValue,
    filter,
    displayProperty: entityDisplayProperty,
  });

  const selectRef = useRef(null);

  const [autocompleteText, setAutocompleteText] = useState(null);

  const extractProperty = (item: object, propertyName: string): string => {
    const propName = propertyName || '_displayName';
    var path = propName.split('.');
    var result = path.reduce((val, name) => (val ? val[name] : null), item);
    return result;
  };

  const getFetchedItems = (): AutocompleteItemDto[] => {
    return fetchedData.map<AutocompleteItemDto>((e) => ({
      value: e.id.toString(),
      displayText: extractProperty(e, entityDisplayProperty),
    }));
  };

  const handleSelect = () => {
    selectRef.current.blur();
  };

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    (localValue) => {
      searchEntity(localValue);
    },
    // delay in ms
    200
  );

  const debouncedClear = useDebouncedCallback((localValue) => {
    searchEntity(localValue);

    if (onChange) onChange(null);
  }, 300);

  useSubscribe(subscribedEventNames, () => debouncedClear(autocompleteText));

  const wrapValue = (localValue: TValue | TValue[], allOptions: ISelectOption<TValue>[]): CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[] => {
    if (!Boolean(localValue)) return undefined;
    if (mode === 'multiple') {
      return Array.isArray(localValue)
        ? (localValue as TValue[]).map<CustomLabeledValue<TValue>>((o) => {
          return getLabeledValue(o, allOptions);
        })
        : [getLabeledValue(localValue as TValue, allOptions)];
    } else return getLabeledValue(localValue as TValue, allOptions);
  };

  const options = useMemo<ISelectOption<TValue>[]>(() => {
    const localData = getFetchedItems() || [];

    const fetchedItems = localData.map<ISelectOption<TValue>>((item) => {
      const option = Boolean(getOptionFromFetchedItem)
        ? (getOptionFromFetchedItem(item) as ISelectOption<TValue>)
        : (item as ISelectOption<TValue>);

      return option;
    });

    const selectedItem = wrapValue(value, fetchedItems);

    // Remove items which are already exist in the fetched items.
    // Note: we shouldn't process full list and make it unique because by this way we'll hide duplicates received from the back-end
    const selectedItems = selectedItem
      ? (Array.isArray(selectedItem) ? selectedItem : [selectedItem]).filter(
        (i) => fetchedItems.findIndex((fi) => fi.value === i.value) === -1
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
    setAutocompleteText(null);

    if (!Boolean(onChange)) return;
    const selectedValue = Boolean(option)
      ? Array.isArray(option)
        ? (option as ISelectOption<TValue>[]).map((o) => o.data)
        : (option as ISelectOption<TValue>).data
      : undefined;

    if (mode === 'multiple') {
      onChange(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
    } else onChange(selectedValue);
  };

  const dataLoaded = fetchedData && fetchedData.length > 0;
  const autocompleteValue = value || dataLoaded || fetchError ? wrapValue(value, options) : undefined;
  const selectPlaceholder = value && !dataLoaded && loading ? 'Loading...' : placeholder ?? '';

  if (readOnly) {
    return (
      <ReadOnlyDisplayFormItem
        value={autocompleteValue}
        type={mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
        disabled={disabled}
        quickviewEnabled={quickviewEnabled}
        quickviewFormPath={quickviewFormPath}
        quickviewDisplayPropertyName={quickviewDisplayPropertyName}
        quickviewGetEntityUrl={quickviewGetEntityUrl}
        quickviewWidth={quickviewWidth ? Number(quickviewWidth) : null} // quick fix string value of quickviewWidth (from configurator)
      />
    );
  }

  const onFocus = () => {
    debouncedFetchItems(autocompleteText);
  };

  const onClear = () => {
    setAutocompleteText(null);
  };

  return (
    <Select<CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[]>
      className="sha-dropdown"
      showSearch={!disableSearch}
      labelInValue={true}
      notFoundContent={notFoundContent}
      defaultActiveFirstOption={false}
      filterOption={false}
      onSearch={handleSearch}
      defaultValue={wrapValue(defaultValue, options)}
      value={autocompleteValue}
      onChange={handleChange}
      allowClear={true}
      onClear={onClear}
      onFocus={onFocus}
      loading={loading}
      placeholder={selectPlaceholder}
      disabled={disabled}
      variant={!bordered ? 'borderless' : undefined}
      onSelect={handleSelect}
      style={style}
      size={size}
      ref={selectRef}
      mode={value && mode === 'multiple' ? mode : undefined} // When mode is multiple and value is null, the control shows an empty tag
    >
      {options?.map(({ value: localValue, label, data }) => (
        <Select.Option value={localValue} key={localValue} data={data}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
};
