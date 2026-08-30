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
import { useStyles } from './styles';

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
  const { styles } = useStyles();
  const options: DefaultOptionType[] = useMemo(() => {
    return verbs.map<DefaultOptionType>((verb) => ({
      value: verb.value,
      label: verb.label,
    }));
  }, [verbs]);

  return (
    <Select
      className={styles.verbSelector}
      options={options}
      value={value}
      size={size}
      onChange={onChange}
    >
    </Select>
  );
};

// Mirrors the scheme check the "API Call" action uses (isGlobalUrl in configurable-actions/api-call.ts)
// to decide whether a URL is routed to this app's own backend or sent as-is to an external host.
const hasScheme = (url: string): boolean => Boolean(url.match(/^(http|https|ftp):\/\//i));

// Heuristic warning only: a bare host (e.g. "some-api.example.com/path", no "http(s)://") reads as
// "external" to a person but has no scheme, so it will be treated as a relative path and sent to this
// app's own backend instead. Deliberately conservative — skips relative-path convention ("/..."),
// mustache expressions ("{{...}}"), and anything without a dot in the host-like segment — so it never
// fires on a legitimate relative API path.
const looksLikeSchemelessExternalUrl = (url: string | null): boolean => {
  if (isNullOrWhiteSpace(url) || hasScheme(url))
    return false;
  if (url.startsWith('/') || url.startsWith('{'))
    return false;
  const hostPart = url.split(/[/?#]/, 1)[0];
  return /\./.test(hostPart) && !/\s/.test(hostPart);
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
  const { styles } = useStyles();
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
  const showSchemeWarning = looksLikeSchemelessExternalUrl(url);

  const autocomplete = (
    <AutoComplete
      disabled={readOnly}
      value={url}
      options={options}
      onSelect={onChangeUrl}
      onChange={onChangeUrl}
      showSearch={{ onSearch: handleSearch }}
      notFoundContent={null}
      {...(props.dropdownStyle ? { styles: { popup: { root: props.dropdownStyle } } } : {})}
      popupMatchSelectWidth={false}
    >
      <Input
        size={props.size}
        prefix={!isNullOrWhiteSpace(props.prefix) ? <span className={styles.affix}>{props.prefix}</span> : undefined}
        suffix={!isNullOrWhiteSpace(props.suffix) ? <span className={styles.affix}>{props.suffix}</span> : undefined}
      />
    </AutoComplete>
  );

  const schemeWarning = showSchemeWarning ? (
    <div className={styles.schemeWarning}>
      This looks like an external host without http:// or https:// — it will be sent as a relative path
      to this app&apos;s own backend instead. Add the scheme (e.g. https://{url}) to call an external API.
    </div>
  ) : null;

  return mode === 'endpoint'
    ? (
      <>
        <Space.Compact className={styles.compactContainer}>
          <VerbSelector
            verbs={props.availableHttpVerbs ?? []}
            onChange={onVerbChange}
            value={props.value && isApiEndpoint(props.value) ? props.value.httpVerb : ""}
            size={props.size}
          />
          {autocomplete}
        </Space.Compact>
        {schemeWarning}
      </>
    )
    : (
      <>
        {autocomplete}
        {schemeWarning}
      </>
    );
};
