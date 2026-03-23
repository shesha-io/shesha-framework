import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox } from 'antd';
import React, { CSSProperties, FC, useEffect, useMemo } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './utils';
import { executeScriptSync } from '@/providers/form/utils';
import { IAjaxResponse, isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';

type RawOptionsPayload = ILabelValue<unknown>[] | { items: ILabelValue<unknown>[] };
type FetchResponse = IAjaxResponse<RawOptionsPayload> | RawOptionsPayload;

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items, referenceListId, direction, value, onChange } = model;

  const { data: refList } = useReferenceList(referenceListId);
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

  const reducedData = useMemo<ILabelValue<unknown>[]>(() => {
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

  const options = useMemo(() => {
    const list = getDataSourceList(model.dataSourceType, items, refList?.items, reducedData) || [];
    return list.map((item) => (item.id ? item : { ...item, id: nanoid() }));
  }, [model.dataSourceType, items, refList?.items, reducedData]);

  const checkboxGroupStyle: CSSProperties = {
    ...model.style,
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    flexWrap: direction === 'vertical' ? 'nowrap' : 'wrap',
    gap: '8px',
  };

  return (
    <div
      tabIndex={0}
      onFocus={(e) => model.onFocus?.({ ...e, target: { value: value, ...e.target } })}
      onBlur={(e) => model.onBlur?.({ ...e, target: { value: value, ...e.target } })}
      style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
    >
      <Checkbox.Group
        className="sha-multi-checkbox"
        value={value}
        onChange={onChange}
        style={checkboxGroupStyle}
        options={options}
      />
    </div>
  );
};

export default MultiCheckbox;
