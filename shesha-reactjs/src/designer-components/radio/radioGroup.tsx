import { Radio, Space } from 'antd';
import React, { ReactElement, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList } from './utils';
import { IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';
import { executeScriptSync } from '@/providers/form/utils';
import { IRadioOptionsSource, IRadioProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

const EMPTY_ITEMS: ILabelValue[] = [];

type RawOptionsPayload = ILabelValue<unknown>[] | { items: ILabelValue<unknown>[] };
type FetchResponse = IAjaxResponse<RawOptionsPayload> | RawOptionsPayload;

/**
 * Resolves the options of a radio group from the configured data source
 * (a fixed list of values, a reference list, or a URL).
 * Extracted from the group so that the component API can expose the same list.
 *
 * `enabled` lets a caller that already holds resolved options keep the hook inert
 * instead of fetching the same URL data source a second time.
 */
export const useRadioOptions = (model: Partial<IRadioOptionsSource>, enabled: boolean = true): ILabelValue[] => {
  const { referenceListId } = model;
  const { data: refListItems } = useReferenceList(enabled ? referenceListId : undefined);

  // A stable reference for the unset case: defaulting to `[]` in the destructuring would allocate
  // a new array on every render, changing the memo's dependency and so the identity of the
  // returned options — which would re-run the component API effect in radio.tsx each time.
  const items = model.items ?? EMPTY_ITEMS;

  //#region Data source is url
  const { refetch, data } = useGet<FetchResponse>({ path: model.dataSourceUrl ?? "", lazy: true });

  useEffect(() => {
    if (enabled && model.dataSourceType === 'url' && isNotNullOrWhiteSpace(model.dataSourceUrl)) {
      refetch().catch((error) => {
        console.error('Failed to fetch data', error);
      });
    }
  }, [enabled, model.dataSourceType, model.dataSourceUrl, refetch]);

  const fetchedData = useMemo<RawOptionsPayload | undefined>(() => {
    if (!data) return undefined;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && 'success' in data) {
      const response = data as IAjaxResponse<RawOptionsPayload>;
      if (isAjaxSuccessResponse(response)) {
        const result = response.result;
        if (isDefined(result) && !Array.isArray(result) && typeof result === 'object' && 'configuration' in result) {
          const config = (result as { configuration?: { items?: ILabelValue<unknown>[] } }).configuration;
          if (config?.items && Array.isArray(config.items)) return config.items;
        }
        return result;
      }
      return undefined;
    }
    if (typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return data as { items: ILabelValue<unknown>[] };
    }
    return undefined;
  }, [data]);

  const reducedData = useMemo<ILabelValue<unknown>[] | undefined>(() => {
    if (!fetchedData) return undefined;

    const list = Array.isArray(fetchedData)
      ? fetchedData
      : (typeof fetchedData === 'object' && 'items' in fetchedData && Array.isArray(fetchedData.items))
        ? fetchedData.items
        : [];

    if (Array.isArray(list) && isNotNullOrWhiteSpace(model.reducerFunc)) {
      return executeScriptSync(model.reducerFunc, { data: list });
    }

    return list;
  }, [fetchedData, model.reducerFunc]);
  //#endregion

  return useMemo(
    () => getDataSourceList(model.dataSourceType ?? 'values', items, refListItems?.items, reducedData),
    [model.dataSourceType, items, refListItems?.items, reducedData],
  );
};

const RadioGroup = (model: IRadioProps & { ref?: React.Ref<HTMLDivElement> }): ReactElement => {
  const { ref, value } = model;
  // Options resolved by the caller win; otherwise fall back to resolving them here. The hook is
  // kept inert when the caller supplied options so a `url` data source is not fetched twice.
  const hasSuppliedOptions = isDefined(model.options);
  const resolvedOptions = useRadioOptions(model, !hasSuppliedOptions);
  const options = model.options ?? resolvedOptions;
  const isDisabled = model.disabled === true || model.readOnly === true;

  const renderCheckGroup = (): ReactElement => (
    <Radio.Group
      ref={ref}
      {...(isNotNullOrWhiteSpace(model.className) ? { className: model.className } : {})}
      disabled={isDisabled}
      value={value != null ? `${value}` : undefined}
      {...(model.onBlur ? { onBlur: model.onBlur } : {})}
      {...(model.onFocus ? { onFocus: model.onFocus } : {})}
      {...(model.onChange ? { onChange: model.onChange } : {})}
      {...(model.onClick ? { onClick: model.onClick } : {})}
      {...(model.onMouseEnter ? { onMouseEnter: model.onMouseEnter } : {})}
      {...(model.onMouseLeave ? { onMouseLeave: model.onMouseLeave } : {})}
      {...(model.style ? { style: model.style } : {})}
    >
      <Space
        {...(model.direction ? { orientation: model.direction } : {})}
        style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
      >
        {options.map((checkItem, index) => (
          <Radio key={index} value={`${checkItem.value}`} disabled={isDisabled}>
            {checkItem.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  return renderCheckGroup();
};

export default RadioGroup;
