import { isPropertySettings } from '@/designer-components/_settings/utils/utils';
import { useActualContextData, useDeepCompareMemo } from '@/hooks';
import { IAnyObject } from '@/interfaces';
import { ReactNode, useState } from 'react';
import { IAutocompleteProps } from './models';
import { evaluateString } from '@/providers/form/utils';
import { buildUrl } from '@/utils';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useShaFormInstanceOrUndefined } from '@/providers';
import { AutocompleteWithRepository } from './autocompleteWithRepository';
import React from 'react';
import { useUrlRepository } from '@/providers/dataTable/repository/urlRepository';

export type UrlAutocompleteProps<TValue = unknown> = Omit<IAutocompleteProps<TValue>, 'dataSourceType'>;


type UrlAutocompleteArgs = UrlAutocompleteProps & {
  searchText: string;
};

const useAutocompleteUrl = (props: UrlAutocompleteArgs): string | undefined => {
  const { searchText } = props;
  const { formData } = useShaFormInstanceOrUndefined() ?? {};

  const q = { q: isPropertySettings(props.queryParams) ? { ...props.queryParams } : props.queryParams };
  const queryParams = useActualContextData(q, undefined, { searchText, value: props.value }).q;

  const queryParamsObj = useDeepCompareMemo(() => {
    const queryParamObj: IAnyObject = {};

    if (queryParams && typeof (queryParams) === 'object') {
      if (Array.isArray(queryParams)) {
        queryParams.forEach(({ param, value }) => {
          if (!isNullOrWhiteSpace(param) && typeof (value) === "string" && !isNullOrWhiteSpace(value)) {
            queryParamObj[param] = /{.*}/i.test(value)
              ? evaluateString(value, { data: formData })
              : value;
          }
        });
      } else
        Object.assign(queryParamObj, queryParams);
    }
    // add autocomplete standard query params if not exists
    if (queryParamObj['term'] === undefined && !isNullOrWhiteSpace(searchText))
      queryParamObj['term'] = searchText;
    if (queryParamObj['selectedValue'] === undefined && isDefined(props.value))
      queryParamObj['selectedValue'] = props.value;

    return queryParamObj;
  }, [queryParams, formData, searchText]);


  const url = useDeepCompareMemo(() => {
    return !isNullOrWhiteSpace(props.dataSourceUrl)
      ? buildUrl(props.dataSourceUrl, queryParamsObj)
      : undefined;
  }, [props.dataSourceUrl, queryParamsObj]);

  return url;
};

export const UrlAutocomplete = <TValue = unknown>(props: UrlAutocompleteProps<TValue>): ReactNode => {
  const { dataSourceUrl, queryParams, fields } = props;
  const [searchText, setSearchText] = useState<string>('');

  const url = useAutocompleteUrl({
    dataSourceUrl,
    queryParams,
    searchText,
  });

  const repository = useUrlRepository({ getListUrl: url ?? "" });

  return (
    <AutocompleteWithRepository<TValue>
      dataSourceType="url"
      repository={repository}
      keyPropName={props.keyPropName ?? "value"}
      displayPropName={props.displayPropName ?? "displayText"}
      fields={fields}
      onSearch={setSearchText}

      value={props.value}
      onChange={props.onChange}
      mode={props.mode}
      readOnly={props.readOnly}
      allowFreeText={props.allowFreeText}
      allowClear={props.allowClear}

      outcomeValueFunc={props.outcomeValueFunc}
      filterKeysFunc={props.filterKeysFunc}
      displayValueFunc={props.displayValueFunc}
      keyValueFunc={props.keyValueFunc}

      quickviewEnabled={props.quickviewEnabled}
      quickviewFormPath={props.quickviewFormPath}
      quickviewDisplayPropertyName={props.quickviewDisplayPropertyName}
      quickviewGetEntityUrl={props.quickviewGetEntityUrl}
      quickviewWidth={props.quickviewWidth}

      placeholder={props.placeholder}
      size={props.size}
    />
  );
};
