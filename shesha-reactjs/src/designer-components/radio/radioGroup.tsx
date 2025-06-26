import { Radio, Space } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { getDataSourceList, IRadioProps } from './utils';

const RadioGroup: FC<IRadioProps> = (model) => {
  const { referenceListId, items = [], value, onChange, defaultValue } = model;
  const { data: refListItems } = useReferenceList(referenceListId);

  //#region Data source is url
    const { refetch, data } = useGet({ path: model.dataSourceUrl, lazy: true });

  useEffect(() => {
    if (model.dataSourceType === 'url' && model.dataSourceUrl) {
      refetch();
    }
  }, [model.dataSourceType, model.dataSourceUrl]);

  useEffect(() => {
    if (defaultValue) {
      onChange(defaultValue);
    }
  }, [defaultValue]);

  const reducedData = useMemo(() => {
    const list = Array.isArray(data?.result) ? data?.result : data?.result?.items;

    if (Array.isArray(list) && model.reducerFunc) {
      return new Function('data', model.reducerFunc)(list) as [];
    }

    return data?.result;
  }, [data?.result, model.reducerFunc]);
  //#endregion

  const options = useMemo(
    () => getDataSourceList(model.dataSourceType, items, refListItems?.items, reducedData) || [],
    [model.dataSourceType, items, refListItems?.items, reducedData]
  );

  const val = value ? `${value}` : defaultValue;

  const renderCheckGroup = () => (
    <Radio.Group
      className="sha-radio-group"
      disabled={model.readOnly}
      defaultValue={defaultValue}
      value={val}
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

  if (model.readOnly) {
    return <ReadOnlyDisplayFormItem type="radiogroup" disabled={model.readOnly} render={renderCheckGroup} />;
  }

  return renderCheckGroup();
};

export default RadioGroup;
