import { Radio, Space } from 'antd';
import React, { FC, forwardRef, ReactElement, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList } from './utils';
import { IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';
import { executeScriptSync } from '@/providers/form/utils';
import { IRadioOptionsSource, IRadioProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined, isNotNullOrWhiteSpace } from '@/utils/nullables';

type RawOptionsPayload = ILabelValue<unknown>[] | { items: ILabelValue<unknown>[] };
type FetchResponse = IAjaxResponse<RawOptionsPayload> | RawOptionsPayload;

/**
 * Resolves the options of a radio group from whichever data source is configured.
 * Extracted from the group so that the component API can expose the same list.
 *
 * `enabled` lets a caller that already holds resolved options keep the hook inert
 * instead of fetching the same URL data source a second time.
 */
export const useRadioOptions = (model: Partial<IRadioOptionsSource>, enabled: boolean = true): ILabelValue[] => {
  const { referenceListId, items = [] } = model;
  const { data: refListItems } = useReferenceList(enabled ? referenceListId : undefined);

  //#region Data source is url
  const { refetch, data } = useGet<FetchResponse>({ path: model.dataSourceUrl ?? "", lazy: true });

  useEffect(() => {
    if (enabled && model.dataSourceType === 'url' && isNotNullOrWhiteSpace(model.dataSourceUrl)) {
      refetch().catch((error) => {
        console.error('Failed to fetch data', error);
        throw error;
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

const RadioGroup: FC<IRadioProps & { ref?: React.Ref<HTMLDivElement> }> = forwardRef<HTMLDivElement, IRadioProps>((model, ref) => {
  const { value } = model;
  // Options resolved by the caller win; otherwise fall back to resolving them here.
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
});

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
