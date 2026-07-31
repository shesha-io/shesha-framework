import { useReferenceList } from '@/providers/referenceListDispatcher';
import { nanoid } from '@/utils/uuid';
import { Checkbox, CheckboxOptionType } from 'antd';
import React, { CSSProperties, FC, useImperativeHandle, useMemo, useRef } from 'react';
import { getDataSourceList } from '../radio/utils';
import { ICheckboxGroupProps } from './interfaces';
import { DEFAULT_MARGINS } from '@/components/formDesigner/utils/designerConstants';
import { isDefined } from '@/utils/nullables';
import { useStyles } from './styles';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';

const MultiCheckbox: FC<ICheckboxGroupProps> = (model) => {
  const { items = [], referenceListId, direction, value, onChange } = model;
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if the component is disabled
  const isDisabled = model.disabled === true;

  // Expose the focus target to the component API without threading a ref
  // through props (the group has no single focusable input element).
  // When disabled, prevent focus programmatically
  useImperativeHandle(model.focusRef, () => ({
    focus: () => {
      if (!isDisabled) {
        containerRef.current?.focus();
      }
    },
  }), [isDisabled]);

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

  const selectedValues = isDefined(value) ? (Array.isArray(value) ? value : [value]) : [];

  // Read-only: like checkbox/textField/numberField, render a static display of the selected
  // option labels instead of an editable control (this component has no read-only style toggle).
  if (model.readOnly === true) {
    const selectedLabels = options
      .filter((option) => selectedValues.some((v) => `${v}` === `${option.value}`))
      .map((option) => (typeof option.label === 'string' || typeof option.label === 'number' ? `${option.label}` : `${option.value}`))
      .join(', ');

    return (
      <ReadOnlyDisplayFormItem
        value={selectedLabels}
        style={model.styleJson}
        styleValue={model}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={isDisabled ? -1 : 0}
      onFocus={isDisabled ? undefined : (e) => model.onFocus?.({ ...e, target: { ...e.target, value: value } })}
      onBlur={isDisabled ? undefined : (e) => model.onBlur?.({ ...e, target: { ...e.target, value: value } })}
      onClick={isDisabled ? undefined : model.onClick}
      onMouseEnter={isDisabled ? undefined : model.onMouseEnter}
      onMouseMove={isDisabled ? undefined : model.onMouseMove}
      onMouseLeave={isDisabled ? undefined : model.onMouseLeave}
      onKeyDown={isDisabled ? undefined : model.onKeyDown}
      onKeyUp={isDisabled ? undefined : model.onKeyUp}
      style={{
        margin: `${DEFAULT_MARGINS.vertical} ${DEFAULT_MARGINS.horizontal}`,
        ...(isDisabled ? { pointerEvents: 'none' } : {}),
      }}
    >
      <Checkbox.Group
        className={styles.checkboxGroup}
        disabled={isDisabled}
        value={selectedValues}
        {...(onChange ? { onChange } : {})}
        style={checkboxGroupStyle}
        options={options}
      />
    </div>
  );
};

export default MultiCheckbox;
