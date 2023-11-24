import React, { CSSProperties, FC, useEffect, useMemo } from 'react';
import { AutoComplete, Input } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useApiEndpoints } from '@/apis/api';
import { useDebouncedCallback } from 'use-debounce';

export interface IEndpointsAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  dropdownStyle?: CSSProperties;
  size?: SizeType;
  readOnly?: boolean;
  httpVerb?: string;
  prefix?: string;
  suffix?: string;
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
}

export const EndpointsAutocomplete: FC<IEndpointsAutocompleteProps> = ({ readOnly = false, ...props }) => {
  const endpointsFetcher = useApiEndpoints({ lazy: true });

  const doFetchItems = (term: string) => {
    endpointsFetcher.refetch({ queryParams: { term, verb: props.httpVerb } });
  };
  const debouncedFetchItems = useDebouncedCallback<(value: string) => void>(
    localValue => {
      doFetchItems(localValue);
    },
    // delay in ms
    200
  );


  useEffect(() => {
    debouncedFetchItems(props.value);
  }, []);

  const handleSearch = (localValue: string) => {
    if (props.onChange) props.onChange(localValue);
    if (localValue) {
      debouncedFetchItems(localValue);
    }
  };

  const loadedEndpoints = endpointsFetcher.data?.result;
  const options = useMemo(() => {
    return (loadedEndpoints ?? []).map<IOption>((ep, idx) => ({
      key: idx,
      label: ep.displayText,
      value: ep.value,
    }));
  }, [loadedEndpoints]);

  const handleSelect = (data: string) => {
    if (props.onChange) props.onChange(data);
  };
  
  const handleChange = (data: string) => {
    if (props.onChange) props.onChange(data);
  };

  return (
    <>
      <AutoComplete
        disabled={readOnly}
        value={props.value}
        options={options}
        onSelect={handleSelect}
        onChange={handleChange}
        onSearch={handleSearch}
        notFoundContent={null}
        size={props.size}
        dropdownStyle={props?.dropdownStyle}
        dropdownMatchSelectWidth={false}
      >
        <Input addonBefore={props.prefix} addonAfter={props.suffix}/>
      </AutoComplete>
    </>
  );
};

export default EndpointsAutocomplete;
