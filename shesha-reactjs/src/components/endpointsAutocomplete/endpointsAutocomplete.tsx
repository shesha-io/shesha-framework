import React, { CSSProperties, FC, useEffect, useMemo } from 'react';
import { AutoComplete, Input, Select, Space } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useApiEndpoints } from '@/apis/api';
import { useDebouncedCallback } from 'use-debounce';
import { IApiEndpoint } from '@/interfaces';
import { DefaultOptionType } from 'antd/lib/select';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';

export interface IHttpVerb {
  id: string;
  label: string;
  value: string;
}

export type EndpointSelectionMode = 'url' | 'endpoint';

export type EndpointsAutocompleteValue = string | IApiEndpoint;

const isApiEndpoint = (value: EndpointsAutocompleteValue): value is IApiEndpoint => {
  return value && typeof (value) === 'object';
};

export interface IEndpointsAutocompleteProps {
  value?: EndpointsAutocompleteValue;
  onChange?: (value: EndpointsAutocompleteValue) => void;
  dropdownStyle?: CSSProperties;
  size?: SizeType;
  readOnly?: boolean;
  httpVerb?: string;
  prefix?: string;
  suffix?: string;

  availableHttpVerbs?: IHttpVerb[];
  mode?: EndpointSelectionMode;
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
}

export interface VerbSelectorProps {
  verbs?: IHttpVerb[];
  value?: string;
  onChange: (newValue?: string) => void;
  size?: SizeType;
}
export const VerbSelector: FC<VerbSelectorProps> = ({ verbs, value, onChange, size }) => {
  const options: DefaultOptionType[] = useMemo(() => {
    return (verbs ?? []).map<DefaultOptionType>((verb) => ({
      value: verb.value,
      label: verb.label,
    }));
  }, [verbs]);

  return (
    <Select
      style={{ width: '120px' }}
      options={options}
      value={value}
      size={size}
      onChange={onChange}
    >
    </Select>
  );
};

const getUrlFromValue = (value?: EndpointsAutocompleteValue): string | null => {
  if (!value)
    return null;

  return isApiEndpoint(value)
    ? value.url
    : value;
};
const getVerbFromValue = (value?: EndpointsAutocompleteValue): string | null => {
  return !value || !isApiEndpoint(value)
    ? null
    : value.httpVerb;
};

export const EndpointsAutocomplete: FC<IEndpointsAutocompleteProps> = ({ readOnly = false, mode = 'url', ...props }) => {
  const endpointsFetcher = useApiEndpoints({ lazy: true });

  const doFetchItems = (term: string, verb: string): void => {
    endpointsFetcher.refetch({ queryParams: { term, verb: verb } });
  };
  const debouncedFetchItems = useDebouncedCallback<(value: string, verb: string) => void>(
    (localValue, localVerb) => {
      doFetchItems(localValue, localVerb);
    },
    // delay in ms
    200,
  );

  const currentVerb = mode === 'url' ? props.httpVerb : getVerbFromValue(props.value);
  useEffect(() => {
    const url = getUrlFromValue(props.value);
    debouncedFetchItems(url, currentVerb);
  }, [currentVerb]);

  const loadedEndpoints = isAjaxSuccessResponse(endpointsFetcher.data)
    ? endpointsFetcher.data.result
    : undefined;
  const options = useMemo(() => {
    return (loadedEndpoints ?? []).map<IOption>((ep, idx) => ({
      key: idx,
      label: ep.displayText,
      value: ep.value,
    }));
  }, [loadedEndpoints]);

  const onChangeUrl = (newUrl: string): void => {
    const newValue: EndpointsAutocompleteValue = mode === 'url'
      ? newUrl
      : { httpVerb: getVerbFromValue(props.value), url: newUrl };

    props.onChange?.(newValue);
  };

  const onVerbChange = (newVerb: string): void => {
    if (mode === 'url')
      return;

    const newValue = { httpVerb: newVerb, url: getUrlFromValue(props.value) };
    props.onChange?.(newValue);
  };

  const handleSearch = (localValue: string): void => {
    onChangeUrl(localValue);

    if (localValue) {
      debouncedFetchItems(localValue, currentVerb);
    }
  };

  const url = getUrlFromValue(props.value);

  const autocomplete = (
    <AutoComplete
      disabled={readOnly}
      value={url}
      options={options}
      onSelect={onChangeUrl}
      onChange={onChangeUrl}
      onSearch={handleSearch}
      notFoundContent={null}
      // size={props.size}
      styles={props.dropdownStyle ? { popup: { root: props.dropdownStyle } } : undefined}
      popupMatchSelectWidth={false}
    >
      <Input addonBefore={props.prefix} addonAfter={props.suffix} size={props.size} />
    </AutoComplete>
  );

  return mode === 'endpoint'
    ? (
      <Space.Compact style={{ width: "100%" }}>
        <VerbSelector verbs={props.availableHttpVerbs} onChange={onVerbChange} value={isApiEndpoint(props.value) ? props.value.httpVerb : null} size={props.size} />
        {autocomplete}
      </Space.Compact>
    )
    : (
      <>{autocomplete}</>
    );
};
