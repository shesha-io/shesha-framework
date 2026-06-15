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
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export interface IHttpVerb {
  id: string;
  label: string;
  value: string;
}

export type EndpointSelectionMode = 'url' | 'endpoint';

export type EndpointsAutocompleteValue = string | IApiEndpoint;

const isApiEndpoint = (value: EndpointsAutocompleteValue | undefined): value is IApiEndpoint => {
  return isDefined(value) && typeof (value) === 'object';
};

export interface IEndpointsAutocompleteProps {
  value?: EndpointsAutocompleteValue | undefined;
  onChange?: ((value: EndpointsAutocompleteValue) => void) | undefined;
  dropdownStyle?: CSSProperties | undefined;
  size?: SizeType | undefined;
  readOnly?: boolean | undefined;
  httpVerb?: string | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;

  availableHttpVerbs?: IHttpVerb[] | undefined;
  mode?: EndpointSelectionMode | undefined;
}

interface IOption {
  value: string;
  label: string | React.ReactNode;
}

export interface VerbSelectorProps {
  verbs: IHttpVerb[];
  value: string;
  onChange: (newValue: string) => void;
  size?: SizeType;
}
export const VerbSelector: FC<VerbSelectorProps> = ({ verbs, value, onChange, size }) => {
  const options: DefaultOptionType[] = useMemo(() => {
    return verbs.map<DefaultOptionType>((verb) => ({
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
  const verb = (props.httpVerb ? evaluateValueAsString(props.httpVerb, { data: formData }) : props.httpVerb) ?? "";


  const doFetchItems = (term: string, verb: string): void => {
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

  const currentVerb = mode === 'url' ? verb : getVerbFromValue(props.value) ?? "";
  useEffect(() => {
    const url = getUrlFromValue(props.value);
    if (!isNullOrWhiteSpace(url))
      debouncedFetchItems(url, currentVerb);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVerb]);

  const loadedEndpoints = endpointsFetcher.data && isAjaxSuccessResponse(endpointsFetcher.data)
    ? endpointsFetcher.data.result
    : undefined;
  const options = useMemo(() => {
    return (loadedEndpoints ?? []).map<IOption>((ep, idx) => ({
      key: idx,
      label: ep.displayText,
      value: ep.value ?? "",
    }));
  }, [loadedEndpoints]);

  const onChangeUrl = (newUrl: string): void => {
    const newValue: EndpointsAutocompleteValue = mode === 'url'
      ? newUrl
      : { httpVerb: getVerbFromValue(props.value) ?? "", url: newUrl } satisfies IApiEndpoint;

    props.onChange?.(newValue);
  };

  const onVerbChange = (newVerb: string): void => {
    if (mode === 'url')
      return;

    const newValue: IApiEndpoint = { httpVerb: newVerb, url: getUrlFromValue(props.value) ?? "" };
    props.onChange?.(newValue);
  };

  const handleSearch = (localValue: string): void => {
    onChangeUrl(localValue);

    if (localValue) {
      debouncedFetchItems(localValue, currentVerb);
    }
  };

  const url = getUrlFromValue(props.value);

  // AutoComplete clones its single child to wire up the input, so the child must be a
  // plain <Input>. Prefix/suffix are rendered as Space.Addon siblings (antd v6 replacement
  // for the deprecated Input addonBefore/addonAfter), not nested inside the AutoComplete.
  const autocomplete = (
    <AutoComplete
      disabled={readOnly}
      value={url}
      options={options}
      onSelect={onChangeUrl}
      onChange={onChangeUrl}
      onSearch={handleSearch}
      notFoundContent={null}
      {...(props.dropdownStyle ? { styles: { popup: { root: props.dropdownStyle } } } : {})}
      popupMatchSelectWidth={false}
    >
      {!isNullOrWhiteSpace(props.prefix) || !isNullOrWhiteSpace(props.suffix)
        ? (
          <Space.Compact>
            {!isNullOrWhiteSpace(props.prefix) && <span>{props.prefix}</span>}
            <Input size={props.size} />
            {!isNullOrWhiteSpace(props.suffix) && <span>{props.suffix}</span>}
          </Space.Compact>
        )
        : (
          <Input size={props.size} />
        )}
    </AutoComplete>
  );

  const autocompleteWithAddons = props.prefix || props.suffix
    ? (
      <Space.Compact style={{ width: "100%" }}>
        {props.prefix && <Space.Addon>{props.prefix}</Space.Addon>}
        {autocomplete}
        {props.suffix && <Space.Addon>{props.suffix}</Space.Addon>}
      </Space.Compact>
    )
    : autocomplete;

  return mode === 'endpoint'
    ? (
      <Space.Compact style={{ width: "100%" }}>
        <VerbSelector
          verbs={props.availableHttpVerbs ?? []}
          onChange={onVerbChange}
          value={props.value && isApiEndpoint(props.value) ? props.value.httpVerb : ""}
          size={props.size}
        />
        {autocomplete}
      </Space.Compact>
    )
    : (
      <>{autocompleteWithAddons}</>
    );
};
