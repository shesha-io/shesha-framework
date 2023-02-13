import { Radio, Space } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from 'restful-react';
import { useGlobalState } from '../../../../providers';
import { useForm } from '../../../../providers/form';
import { useReferenceList } from '../../../../providers/referenceListDispatcher';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { getDataSourceList, IRadioProps } from './utils';

const RadioGroup: FC<IRadioProps> = model => {
  const { formMode, formData, isComponentDisabled } = useForm();
  const { globalState } = useGlobalState();
  const { referenceListId, items = [], value, onChange } = model;
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

  const reducedData = useMemo(() => {
    if (Array.isArray(data?.result) && model?.reducerFunc) {
      return new Function('data', model?.reducerFunc)(data?.result) as [];
    }

    return data?.result;
  }, [data?.result, model?.reducerFunc]);
  //#endregion

  const options = useMemo(
    () => getDataSourceList(model?.dataSourceType, items, refListItems?.items, reducedData) || [],
    [model?.dataSourceType, items, refListItems?.items, reducedData]
  );

  const isReadOnly = model?.readOnly || formMode === 'readonly';

  const disabled = isComponentDisabled(model);

  const renderCheckGroup = () => (
    <Radio.Group disabled={isReadOnly} value={value} onChange={onChange} style={model?.style}>
      <Space direction={model?.direction}>
        {options?.map((checkItem, index) => (
          <Radio key={index} value={checkItem.value}>
            {checkItem.label}
          </Radio>
        ))}
      </Space>
    </Radio.Group>
  );

  if (isReadOnly) {
    return <ReadOnlyDisplayFormItem type="radiogroup" disabled={disabled} render={renderCheckGroup} />;
  }

  return renderCheckGroup();
};

export default RadioGroup;
