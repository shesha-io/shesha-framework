import { Checkbox, Col, Row } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from 'restful-react';
import { useForm, useGlobalState } from '../../../../providers';
import { useReferenceList } from '../../../../providers/referenceListDispatcher';
import { getDataSourceList } from '../radio/utils';
import { getSpan, ICheckboxGroupProps } from './utils';

const MultiCheckbox: FC<ICheckboxGroupProps> = model => {
  const { formMode, formData } = useForm();
  const { globalState } = useGlobalState();
  const { items, referenceListId, direction, value, onChange } = model;

  const { data: refList } = useReferenceList(referenceListId);

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

  const options = useMemo(() => getDataSourceList(model?.dataSourceType, items, refList?.items, reducedData) || [], [
    model?.dataSourceType,
    items,
    refList?.items,
    reducedData,
  ]);

  const isReadOnly = model?.readOnly || formMode === 'readonly';

  return (
    <Checkbox.Group value={value} onChange={onChange} style={model?.style}>
      <Row>
        {options.map(({ id, label, value: v }) => (
          <Col id={id} span={getSpan(direction, options.length)}>
            <Checkbox id={id} value={v} disabled={isReadOnly}>
              {label}
            </Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default MultiCheckbox;
