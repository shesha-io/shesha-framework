import { Radio, Space } from 'antd';
import React, { FC, ReactElement, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList, IRadioProps } from './utils';
import { IAjaxResponse } from '@/interfaces';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';
import { executeScriptSync } from '@/providers/form/utils';

type FetchResponse = ILabelValue<any>[] | {
  items?: ILabelValue<any>[];
};

const RadioGroup: FC<IRadioProps> = (model) => {
  const { referenceListId, items = [], value, onChange } = model;
  const { data: refListItems } = useReferenceList(referenceListId);

  //#region Data source is url
  const { refetch, data } = useGet<IAjaxResponse<FetchResponse>>({ path: model.dataSourceUrl, lazy: true });

  useEffect(() => {
    if (model.dataSourceType === 'url' && model.dataSourceUrl) {
      refetch();
    }
  }, [model.dataSourceType, model.dataSourceUrl]);

  const fetchedData = isAjaxSuccessResponse(data) ? data.result : undefined;

  const reducedData = useMemo<ILabelValue<any>[]>(() => {
    const list = fetchedData
      ? Array.isArray(fetchedData)
        ? fetchedData
        : fetchedData.items ?? []
      : undefined;

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
      <Space direction={model.direction}>
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
