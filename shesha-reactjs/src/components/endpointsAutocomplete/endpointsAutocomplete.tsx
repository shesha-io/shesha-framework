import React, { CSSProperties, FC, useEffect, useMemo } from 'react';
import { AutoComplete, Input, Select, Space } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { useApiEndpoints } from '@/apis/api';
import { useDebouncedCallback } from 'use-debounce';
import { IApiEndpoint } from '@/interfaces';
import { DefaultOptionType } from 'antd/lib/select';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { useFormData } from '@/providers';
import { evaluateValueAsString } from '@/providers/form/utils';

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
  const { data: formData } = useFormData();
  const verb = props.httpVerb ? evaluateValueAsString(props.httpVerb, { data: formData }) : props.httpVerb;

  // Helper to check if verb is a valid resolved string
  const isValidVerb = (verbValue: any): verbValue is string => {
    return typeof verbValue === 'string' && verbValue.trim() !== '';
  };


  const doFetchItems = (term: string, verb: string): void => {
    // Additional safety check: only make the request if verb is valid
    if (!isValidVerb(verb)) {
      return;
    }
    endpointsFetcher.refetch({ queryParams: { term, verb: verb } }).catch((error) => {
      console.error('Failed to fetch endpoints', error);
      throw error;
    });
  };
  const debouncedFetchItems = useDebouncedCallback<(value: string, verb: string) => void>(
    (localValue, localVerb) => {
      doFetchItems(localValue, localVerb);
    },
    // delay in ms
    200,
  );

  const currentVerb = mode === 'url' ? verb : getVerbFromValue(props.value);
  useEffect(() => {
    // Only fetch if we have a valid resolved verb
    if (!isValidVerb(currentVerb)) {
      return;
    }

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

    // Only fetch if we have a valid search value and a valid resolved verb
    if (localValue && isValidVerb(currentVerb)) {
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
      showSearch={{ onSearch: handleSearch }}
      notFoundContent={null}
      // size={props.size}
      styles={props.dropdownStyle ? { popup: { root: props.dropdownStyle } } : undefined}
      popupMatchSelectWidth={false}
    >
      <Space.Compact style={{ width: "100%" }}>
        {props.prefix && <Space.Addon>{props.prefix}</Space.Addon>}
        <Input size={props.size} />
        {props.suffix && <Space.Addon>{props.suffix}</Space.Addon>}
      </Space.Compact>
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
