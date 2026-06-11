import React, { FC, ReactNode, useCallback } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { executeExpression } from '@/providers/form/utils';
import { IDropdownProps, ILabelValue } from './model';
import { Select } from 'antd';
import GenericRefListDropDown from '@/components/refListDropDown/genericRefListDropDown';
import { CustomLabeledValue, GetLabeledValueFunc, GetOptionFromFetchedItemFunc, IncomeValueFunc, ISelectOption, OutcomeValueFunc } from '@/components/refListDropDown/models';
import { useStyles } from './style';
import ReflistTag from '../refListDropDown/reflistTag';
import { getNumberOrUndefined } from '@/utils/string';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

export const Dropdown: FC<IDropdownProps> = ({
  valueFormat,
  incomeCustomJs,
  outcomeCustomJs,
  labelCustomJs,
  dataSourceType,
  values,
  onChange,
  value,
  referenceListId,
  mode,
  disableItemValue = false,
  ignoredValues = [],
  disabledValues = [],
  placeholder,
  readOnly,
  style,
  size,
  showIcon,
  solidColor,
  showItemName,
  allowClear = true,
  displayStyle,
  tagStyle,
  enableStyleOnReadonly,
}) => {
  const { styles } = useStyles({ style: style ?? {} });

  const selectedMode = mode === 'multiple' || mode === 'tags' ? mode : undefined;

  // Extracts value from a fetched RefList item. Stored in the value poroperty of the item
  const incomeValueFunc = useCallback<IncomeValueFunc>((value, args) => {
    if (valueFormat === 'listItem') {
      return isDefined(value) ? value.itemValue : null; // number
    }
    if (valueFormat === 'custom') {
      if (isNullOrWhiteSpace(incomeCustomJs))
        throw new Error('incomeCustomJs is required for custom value format');
      return executeExpression<string>(incomeCustomJs, { ...args, value }, null) ?? ""; // string
    }
    return value; // DTO
  }, [valueFormat, incomeCustomJs]);

  // Outcome function converts fetched RefList item to a value that is saved to form on selection
  // result is stored in the data property of item
  const outcomeValueFunc = useCallback<OutcomeValueFunc>((value, args) => {
    if (valueFormat === 'listItem') {
      return isDefined(value)
        ? { item: value.item, itemValue: value.itemValue }
        : null;
    }
    if (valueFormat === 'custom') {
      if (isNullOrWhiteSpace(outcomeCustomJs))
        throw new Error('outcomeCustomJs is required for custom value format');
      return executeExpression(outcomeCustomJs, { ...args, value }, null);
    }
    return isDefined(value) ? value.itemValue : null;
  }, [valueFormat, outcomeCustomJs]);

  // is used for RefLists only
  const getLabeledValue = useCallback<GetLabeledValueFunc<number>>((value, options) => {
    if (!isDefined(value))
      return undefined;

    const itemValue = typeof (value) === "object"
      ? incomeValueFunc(value, {})
      : value;
    const item = options.find((i) => i.value === itemValue);
    return isDefined(item) && isDefined(itemValue) && typeof (itemValue) !== 'object'
      ? {
        value: itemValue,
        label: !isNullOrWhiteSpace(item.label) ? item.label : 'unknown',
        // color: item.color,
        // icon: item.icon,
        data: item.data,
        // description: item.description,
      } satisfies CustomLabeledValue<number>
      : undefined;
  }, [incomeValueFunc]);

  const getOptionFromFetchedItem = useCallback<GetOptionFromFetchedItemFunc<number>>((fetchedItem, args) => {
    // get custom label using JS expression if specified
    const label = (!isNullOrWhiteSpace(labelCustomJs)
      ? executeExpression<string>(labelCustomJs, { value: fetchedItem }, null,
        (e) => {
          console.error(e);
          return 'unknown';
        },
      )
      : fetchedItem.item) ?? "";

    const itemData = outcomeValueFunc(fetchedItem, args);
    const value = typeof (itemData) === "object" && isDefined(itemData)
      ? incomeValueFunc(itemData, {})
      : itemData;

    return {
      value: value as unknown as string | number,
      label,
      data: itemData as unknown as number,
      color: fetchedItem.color ?? undefined,
      icon: fetchedItem.icon ?? undefined,
      description: fetchedItem.description ?? undefined,
    } satisfies ISelectOption<number>;
  }, [labelCustomJs, outcomeValueFunc, incomeValueFunc]);

  if (dataSourceType === 'referenceList') {
    return isDefined(referenceListId)
      ? (
        <GenericRefListDropDown<number>
          onChange={onChange}
          referenceListId={referenceListId}
          value={value}
          variant="borderless"
          mode={selectedMode}
          disabledValues={disableItemValue ? disabledValues : []}
          filters={ignoredValues}
          placeholder={placeholder}
          readOnly={readOnly}
          size={size}
          showIcon={showIcon}
          solidColor={solidColor}
          showItemName={showItemName}
          className={styles.dropdown}
          style={{ ...style }}
          tagStyle={tagStyle}
          allowClear={allowClear}
          getLabeledValue={getLabeledValue}
          getOptionFromFetchedItem={getOptionFromFetchedItem}
          displayStyle={displayStyle}
          enableStyleOnReadonly={enableStyleOnReadonly}
        />
      )
      : undefined;
  }

  const getOptions = (): ILabelValue<number>[] => {
    const result: ILabelValue<number>[] = [];
    (values ?? []).forEach((i) => {
      const itemValue = getNumberOrUndefined(i.value);
      if (itemValue)
        result.push({ ...i, value: itemValue });
    });

    return result;
  };
  const options = getOptions();

  const selectedValue = options.length > 0
    ? value
    : null;

  const getSelectValue = (): { label: ReactNode }[] => {
    const selectedValues = Array.isArray(selectedValue) ? selectedValue : [selectedValue];
    return options.filter(({ value: currentValue }) => selectedValues.indexOf(currentValue) > -1).map(({ label }) => ({ label }));
  };

  if (readOnly) {
    const displayValue: unknown = mode === 'multiple'
      ? displayStyle === 'tags'
        ? (Array.isArray(selectedValue) ? selectedValue : []).map((x) => options.find((o) => o.value === x))
        : getSelectValue()
      : options.find((o) => o.value === selectedValue);
    return (
      <ReadOnlyDisplayFormItem
        showIcon={showIcon}
        solidColor={solidColor}
        showItemName={showItemName}
        tagStyle={tagStyle}
        style={style}
        dropdownDisplayMode={displayStyle === 'tags' ? 'tags' : 'raw'}
        type={mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
        value={displayValue}
      />
    );
  }

  if (mode !== 'multiple' && mode !== 'tags' && displayStyle === 'tags') {
    return (
      <Select
        className={styles.dropdown}
        allowClear={allowClear}
        {...(onChange ? { onChange } : {})}
        value={selectedValue ?? null}
        variant="borderless"
        disabled={readOnly ?? false}
        {...(selectedMode ? { mode: selectedMode } : {})}
        placeholder={placeholder}
        size={size}
        popupMatchSelectWidth={false}
        style={{ width: 'max-content', height: 'max-content' }}
        labelRender={(props) => {
          const option = options.find((o) => o.value === props.value);
          return option
            ? (
              <ReflistTag
                key={option.value}
                value={option.value}
                description={option.description}
                color={option.color}
                icon={option.icon}
                showIcon={showIcon}
                tagStyle={tagStyle}
                solidColor={solidColor}
                showItemName={showItemName}
                label={option.label}
              />
            )
            : undefined;
        }}
        options={options.map(({ value: localValue, label }) => ({ value: localValue, label }))}
      />
    );
  }

  return (
    <Select
      className={styles.dropdown}
      allowClear={allowClear}
      {...(onChange ? { onChange } : {})}
      value={selectedValue ?? null}
      variant="borderless"
      disabled={readOnly ?? false}
      {...(selectedMode ? { mode: selectedMode } : {})}
      placeholder={placeholder}
      size={size}
      {...(style ? { style } : {})}
      {...(displayStyle === 'tags' ? {
        labelRender: (props) => {
          const option = options.find((o) => o.value === props.value);
          return option
            ? (
              <ReflistTag
                value={option.value}
                description={option.description}
                color={option.color}
                icon={option.icon}
                showIcon={showIcon}
                tagStyle={tagStyle}
                solidColor={solidColor}
                showItemName={showItemName}
                label={option.label}
              />
            )
            : undefined;
        },
      } : {})}
      options={options.map(({ value: localValue, label }) => ({ value: localValue, label }))}
    />
  );
};
