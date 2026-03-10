import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox } from 'antd';
import React, { CSSProperties, FC, useEffect, useMemo } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './utils';
import { executeScriptSync } from '@/providers/form/utils';
import { IAjaxResponse } from '@/interfaces';
import { isAjaxSuccessResponse } from '@/interfaces/ajaxResponse';
import { ILabelValue } from '../dropdown/model';

type FetchResponse = ILabelValue<any>[] | {
  items?: ILabelValue<any>[];
};

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items, referenceListId, direction, value, onChange } = model;

  const { data: refList } = useReferenceList(referenceListId);
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
