import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox, CheckboxOptionType } from 'antd';
import React, { CSSProperties, FC, useImperativeHandle, useMemo, useRef } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined } from '@/utils/nullables';
import { useStyles } from './styles';

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items = [], referenceListId, direction, value, onChange } = model;
  const containerRef = useRef<HTMLDivElement>(null);

  // Expose the focus target to the component API without threading a ref
  // through props (the group has no single focusable input element).
  useImperativeHandle(model.focusRef, () => ({ focus: () => containerRef.current?.focus() }), []);

  const { data: refList } = useReferenceList(referenceListId);

  const options = useMemo<CheckboxOptionType[]>(() => {
    const list = getDataSourceList(model.dataSourceType, items, refList?.items);
    return list.map<CheckboxOptionType>((item) => (item.id ? item : { ...item, id: nanoid(), key: nanoid() }));
  }, [model.dataSourceType, items, refList?.items]);

  // Per-checkbox appearance (check mark, dimensions, border, background, etc.)
  // is emitted by the scoped emotion class onto each `.ant-checkbox-inner`;
  // only layout stays on the group container.
  const { styles } = useStyles(model);

  const checkboxGroupStyle: CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    flexWrap: direction === 'vertical' ? 'nowrap' : 'wrap',
    gap: '8px',
    // Honour the Custom style (styleJson) at the group level.
    ...(isDefined(model.styleJson) ? model.styleJson : {}),
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onFocus={(e) => model.onFocus?.({ ...e, target: { ...e.target, value: value } })}
      onBlur={(e) => model.onBlur?.({ ...e, target: { ...e.target, value: value } })}
      onClick={model.onClick}
      onMouseEnter={model.onMouseEnter}
      onMouseMove={model.onMouseMove}
      onMouseLeave={model.onMouseLeave}
      onKeyDown={model.onKeyDown}
      onKeyUp={model.onKeyUp}
      style={{ margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}` }}
    >
      <Checkbox.Group
        className={styles.checkboxGroup}
        value={isDefined(value) ? (Array.isArray(value) ? value : [value]) : []}
        {...(onChange ? { onChange } : {})}
        style={checkboxGroupStyle}
        options={options}
      />
    </div>
  );
};

export default MultiCheckbox;
