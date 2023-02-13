import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Select, Tag } from 'antd';
import { AjaxResponseBase, AutocompleteItemDto } from '../../apis/autocomplete';
import { useGet } from 'restful-react';
import { useDebouncedCallback } from 'use-debounce';
import { useSubscribe } from '../..';
import { ReadOnlyDisplayFormItem } from './../readOnlyDisplayFormItem';
import { CustomLabeledValue, ISelectOption, IUrlAutocompleteProps, IUrlFetcherQueryParams } from './models';
import { getQueryString, trimQueryString } from './utils';

export const UrlAutocomplete = <TValue,>(props: IUrlAutocompleteProps<TValue>) => {
  const {
    value,
    defaultValue,
    placeholder,
    onChange,
    disabled,
    bordered,
    dataSourceUrl,
    style,
    size,
    mode,
    notFoundContent,
    queryParams: incomingQueryParams,
    getOptionFromFetchedItem,
    getLabeledValue,
    readOnly,
    readOnlyMultipleMode = 'raw',
    disableSearch,
    subscribedEventNames,
    allowFreeText = false,
  } = props;

  const urlFetcher = useGet<any, AjaxResponseBase, IUrlFetcherQueryParams, void>(
    decodeURI(trimQueryString(dataSourceUrl)) || '',
    {
      lazy: true,
    }
  );

  const selectRef = useRef(null);

  const [autocompleteText, setAutocompleteText] = useState(null);

  const additionalQueryParams = incomingQueryParams || {};

  const doFetchItems = (term: string, ignoreSelectedValue = false) => {
    const selectedValue =
      typeof value === 'string' && !ignoreSelectedValue
        ? value
        : /*: isStringArray(value)
          ? value*/
        undefined;

    if (dataSourceUrl) {
      const queryParams = {
        ...getQueryString(dataSourceUrl),
        term,
        selectedValue,
        ...additionalQueryParams,
      };

      urlFetcher.refetch({
        queryParams,
      });
    }
  };

  useEffect(() => {
    doFetchItems(null);
  }, []);

  useEffect(() => {
    if (value && !autocompleteText) {
      // Refresh the autocomplete whenever the value changes to
      // TODO: Review this by, maybe, passing renderWhenDataIsReady to the dialog form so that items are not fetched may times
      doFetchItems(null);
    }
  }, [value]);

  useSubscribe(subscribedEventNames, () => debouncedClear(autocompleteText));

  const getFetchedItems = (): AutocompleteItemDto[] => {
    return urlFetcher.data?.result;
  };

  // Refetch when clear because at this stage, only 1 item (which is the previsously selected item) is in the list of options

  const onFocus = () => {
    doFetchItems(null, true);
  };

  const handleSelect = () => {
    selectRef.current.blur();
  };

  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    localValue => {
      doFetchItems(localValue);
    },
    // delay in ms
    200
  );

  const debouncedClear = useDebouncedCallback(localValue => {
    doFetchItems(localValue);

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
    const fetchedData = getFetchedItems() || [];

    const fetchedItems = fetchedData.map<ISelectOption<TValue>>(item => {
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

    if (autocompleteText && allowFreeText && !value) {
      if (fetchedItems.findIndex(fi => fi.label === autocompleteText) === -1){
        result.push({ label: autocompleteText, value: autocompleteText, data: autocompleteText });
      }
    }

    return result;
  }, [value, autocompleteText, urlFetcher]);

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

  const autocompleteValue = wrapValue(value);

  if (readOnly || disabled) {
    return (
      <ReadOnlyDisplayFormItem
        value={autocompleteValue}
        type={mode === 'multiple' || mode === 'tags' ? 'dropdownMultiple' : 'dropdown'}
        disabled={disabled}
      />
    );
  }

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
      loading={urlFetcher?.loading}
      placeholder={placeholder}
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
