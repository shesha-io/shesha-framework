import { Radio, Space } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useFormData, useGlobalState } from '../../../../providers';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { getDataSourceList, IRadioProps } from './utils';
import { evaluateValue } from '@/utils/publicUtils';

const RadioGroup: FC<IRadioProps> = (model) => {
  const { data: formData } = useFormData();
  const { globalState } = useGlobalState();
  const { referenceListId, items = [], value, onChange, defaultValue } = model;
  const { data: refListItems } = useReferenceList(referenceListId);

  //#region Data source is url
  const getEvaluatedUrl = (url: string) => {
    if (!url) return '';
    return (() => {
      // tslint:disable-next-line:function-constructor
      return new Function('data, globalState', url)(formData, globalState); // Pass data, query, globalState
    })();
  };

  const { refetch, data } = useGet({ path: getEvaluatedUrl(model?.dataSourceUrl), lazy: true });

  useEffect(() => {
    if (model?.dataSourceType === 'url' && model?.dataSourceUrl) {
      refetch();
    }
  }, [model?.dataSourceType, model?.dataSourceUrl]);

  useEffect(() => {
    if (defaultValue) {
      onChange(evaluateValue(defaultValue, { data: formData, globalState }));
    }
  }, [defaultValue]);

  const reducedData = useMemo(() => {
    const list = Array.isArray(data?.result) ? data?.result : data?.result?.items;

    if (Array.isArray(list) && model?.reducerFunc) {
      return new Function('data', model?.reducerFunc)(list) as [];
    }

    return data?.result;
  }, [data?.result, model?.reducerFunc]);
  //#endregion

  const options = useMemo(
    () => getDataSourceList(model?.dataSourceType, items, refListItems?.items, reducedData) || [],
    [model?.dataSourceType, items, refListItems?.items, reducedData]
  );

  const defaultVal = evaluateValue(defaultValue, { data: formData, globalState });
  const val = !!value ? `${value}` : defaultVal;

  const renderCheckGroup = () => (
    <Radio.Group
      className="sha-radio-group"
      disabled={model.readOnly}
      defaultValue={defaultVal}
      value={val}
      onChange={onChange}
      style={model?.style}
    >
      <Space direction={model?.direction}>
        {options?.map((checkItem, index) => (
          <Radio key={index} value={`${checkItem.value}`} disabled={model.disabled}>
            {checkItem.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  if (model.readOnly) {
    return <ReadOnlyDisplayFormItem type="radiogroup" disabled={model.disabled} render={renderCheckGroup} />;
  }

  return renderCheckGroup();
};

export default RadioGroup;
