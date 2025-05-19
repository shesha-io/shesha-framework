import { useGet } from '@/hooks';
import { executeScriptSync } from '@/index';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox } from 'antd';
import React, { CSSProperties, FC, useEffect, useMemo } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './utils';

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items, referenceListId, direction, value, onChange } = model;

  const { data: refList } = useReferenceList(referenceListId);
  const { refetch, data } = useGet({ path: model.dataSourceUrl, lazy: true });

  useEffect(() => {
    if (model.dataSourceType === 'url' && model.dataSourceUrl) {
      refetch();
    }
  }, [model.dataSourceType, model.dataSourceUrl]);

  const reducedData = useMemo(() => {
    const list = Array.isArray(data?.result) ? data?.result : data?.result?.items;

    if (Array.isArray(list) && model.reducerFunc) {
      return executeScriptSync(model.reducerFunc, { data: list });
    }

    return data?.result;
  }, [data?.result, model.reducerFunc]);

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
