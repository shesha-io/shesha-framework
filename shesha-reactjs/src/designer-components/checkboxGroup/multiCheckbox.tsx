import { Checkbox, Col, Row } from 'antd';
import React, { FC, useEffect, useMemo } from 'react';
import { useGet } from '@/hooks';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { getDataSourceList } from '../radio/utils';
import { getSpan, ICheckboxGroupProps } from './utils';
import { nanoid } from '@/utils/uuid';
import { executeScriptSync } from '@/index';

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

  return (
    <div
      tabIndex={0}
      onFocus={(e) => model.onFocus?.({ ...e, target: { value: value, ...e.target } })}
      onBlur={(e) => model.onBlur?.({ ...e, target: { value: value, ...e.target } })}
    >
      <Checkbox.Group className="sha-multi-checkbox" value={value} onChange={onChange} style={model.style}>
        <Row>
          {options.map(({ id, label, value: v }) => (
            <Col id={id} span={getSpan(direction, options.length)} key={id}>
              <Checkbox id={id} value={v} disabled={model.readOnly}>
                {label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    </div>
  );
};

export default MultiCheckbox;
