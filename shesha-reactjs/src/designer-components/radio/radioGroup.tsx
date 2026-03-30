import { Radio, Space } from 'antd';
import React, { FC, ReactElement, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList } from './utils';
import { IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';
import { executeScriptSync } from '@/providers/form/utils';
import { IRadioProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';

type RawOptionsPayload = ILabelValue<unknown>[] | { items: ILabelValue<unknown>[] };
type FetchResponse = IAjaxResponse<RawOptionsPayload> | RawOptionsPayload;

const RadioGroup: FC<IRadioProps> = (model) => {
  const { referenceListId, items = [], value, onChange } = model;
  const { data: refListItems } = useReferenceList(referenceListId);

  //#region Data source is url
  const { refetch, data } = useGet<FetchResponse>({ path: model.dataSourceUrl, lazy: true });

  useEffect(() => {
    if (model.dataSourceType === 'url' && model.dataSourceUrl) {
      refetch();
    }
  }, [model.dataSourceType, model.dataSourceUrl, refetch]);

  const fetchedData = useMemo<RawOptionsPayload | undefined>(() => {
    if (!data) return undefined;
    if (Array.isArray(data)) return data;
    if (typeof data === 'object' && 'success' in data) {
      const response = data as IAjaxResponse<RawOptionsPayload>;
      if (isAjaxSuccessResponse(response)) {
        const result = response.result;
        if (result && !Array.isArray(result) && typeof result === 'object' && 'configuration' in result) {
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

    if (Array.isArray(list) && model.reducerFunc) {
      return executeScriptSync(model.reducerFunc, { data: list });
    }

    return list;
  }, [fetchedData, model.reducerFunc]);
  //#endregion

  const options = useMemo(
    () => getDataSourceList(model.dataSourceType, items, refListItems?.items, reducedData) || [],
    [model.dataSourceType, items, refListItems?.items, reducedData],
  );

  const renderCheckGroup = (): ReactElement => (
    <Radio.Group
      className="sha-radio-group"
      disabled={model.readOnly}
      value={value != null ? `${value}` : undefined}
      onBlur={model.onBlur}
      onFocus={model.onFocus}
      onChange={onChange}
      style={model.style}
    >
      <Space direction={model.direction} style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}>
        {options?.map((checkItem, index) => (
          <Radio key={index} value={`${checkItem.value}`} disabled={model.readOnly}>
            {checkItem.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  return renderCheckGroup();
};

export default RadioGroup;
