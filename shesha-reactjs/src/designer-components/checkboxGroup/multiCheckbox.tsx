import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox, CheckboxOptionType } from 'antd';
import React, { CSSProperties, FC, useMemo } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined } from '@/utils/nullables';

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items = [], referenceListId, direction, value, onChange } = model;

  const { data: refList } = useReferenceList(referenceListId);

  const options = useMemo<CheckboxOptionType[]>(() => {
    const list = getDataSourceList(model.dataSourceType, items, refList?.items);
    return list.map<CheckboxOptionType>((item) => (item.id ? item : { ...item, id: nanoid() }));
  }, [model.dataSourceType, items, refList?.items]);

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
      onFocus={(e) => model.onFocus?.({ ...e, target: { ...e.target, value: value } })}
      onBlur={(e) => model.onBlur?.({ ...e, target: { ...e.target, value: value } })}
      style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
    >
      <Checkbox.Group
        className="sha-multi-checkbox"
        value={isDefined(value) && Array.isArray(value) ? value : []}
        {...(onChange ? { onChange } : {})}
        style={checkboxGroupStyle}
        options={options}
      />
    </div>
  );
};

export default MultiCheckbox;
