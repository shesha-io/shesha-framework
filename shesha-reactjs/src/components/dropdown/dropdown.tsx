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
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

const normalizeValue = (value: number | string): number | string => getNumberOrUndefined(value) ?? value;

export const Dropdown: FC<IDropdownProps> = ({
  // Read deliberately: forms saved before Binding Format still resolve their values through it.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  valueFormat,
  bindingFormat,
  incomeCustomJs,
  outcomeCustomJs,
  labelCustomJs,
  dataSourceType,
  values,
  onChange,
  value: inputValue,
  referenceListId,
  mode: configuredMode,
  enableMultiSelect,
  disableItemValue = false,
  ignoredValues = [],
  disabledValues = [],
  placeholder,
  readOnlyPlaceholder,
  readOnly,
  style,
  size,
  showIcon,
  tagVariant = 'solid',
  /* Tags show their label unless explicitly turned off. A newly dropped component ships with these
     unset (only saved forms get them back-filled by the migrator), and defaulting to false rendered
     an empty tag body. */
  showItemName = true,
  allowClear = true,
  displayStyle,
  tagStyle,
  enableStyleOnReadonly,
  className,
  selectRef,
  events,
  styleValue,
}) => {
  /* Enable Multi-Select supersedes `mode`; `mode` is still honoured for forms saved before the
     rename (and for the 'tags' variant, which the boolean cannot express). */
  const mode = isDefined(enableMultiSelect)
    ? (enableMultiSelect ? 'multiple' : 'single')
    : configuredMode;

  const { styles } = useStyles({ style: style ?? {} });
  // The caller's Appearance class is merged in rather than replacing the component's own class,
  // so the base layout rules survive when a form supplies configured styles.
  const selectClassName = isNullOrWhiteSpace(className) ? styles.dropdown : `${styles.dropdown} ${className}`;

  const value = isDefined(inputValue)
    ? Array.isArray(inputValue)
      ? inputValue.map(normalizeValue) as number[] | string[]
      : normalizeValue(inputValue)
    : undefined;

  const selectedMode = mode === 'multiple' || mode === 'tags' ? mode : undefined;

  // Extracts value from a fetched RefList item. Stored in the value poroperty of the item
  const incomeValueFunc = useCallback<IncomeValueFunc>((value, args) => {
    // Binding Format supersedes the legacy valueFormat. `itemLabel` binds the display text, so the
    // stored string is matched back to its item to drive the selection.
    if (bindingFormat === 'itemLabel') {
      return value;
    }
    if (bindingFormat === 'itemValue') {
      return isDefined(value) && typeof value === 'object' ? value.itemValue : value;
    }
    if (valueFormat === 'listItem') {
      return isDefined(value) ? value.itemValue : null; // number
    }
    if (valueFormat === 'custom') {
      if (isNullOrWhiteSpace(incomeCustomJs))
        throw new Error('incomeCustomJs is required for custom value format');
      return executeExpression<string>(incomeCustomJs, { ...args, value }, null) ?? ""; // string
    }
    return value; // DTO
  }, [bindingFormat, valueFormat, incomeCustomJs]);

  // Outcome function converts fetched RefList item to a value that is saved to form on selection
  // result is stored in the data property of item
  const outcomeValueFunc = useCallback<OutcomeValueFunc>((value, args) => {
    // `itemLabel` stores the display text (e.g. to save the selected item's caption to a string
    // property); `itemValue` stores the underlying value.
    if (bindingFormat === 'itemLabel') {
      return isDefined(value) ? value.item : null;
    }
    if (bindingFormat === 'itemValue') {
      return isDefined(value) ? value.itemValue : null;
    }
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
  }, [bindingFormat, valueFormat, outcomeCustomJs]);

  // is used for RefLists only
  const getLabeledValue = useCallback<GetLabeledValueFunc<number | string>>((value, options) => {
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
      } satisfies CustomLabeledValue<number | string>
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
        <GenericRefListDropDown<number | string>
          onChange={onChange}
          referenceListId={referenceListId}
          value={value}
          variant="borderless"
          {...(selectedMode ? { mode: selectedMode } : {})}
          disabledValues={disableItemValue ? disabledValues : []}
          filters={ignoredValues}
          placeholder={placeholder}
          readOnly={readOnly}
          size={size}
          showIcon={showIcon}
          tagVariant={tagVariant}
          showItemName={showItemName}
          className={selectClassName}
          style={{ ...style }}
          tagStyle={tagStyle}
          allowClear={allowClear}
          getLabeledValue={getLabeledValue}
          getOptionFromFetchedItem={getOptionFromFetchedItem}
          displayStyle={displayStyle}
          enableStyleOnReadonly={enableStyleOnReadonly}
          selectRef={selectRef}
          events={events}
          styleValue={styleValue}
        />
      )
      : undefined;
  }

  const getOptions = (): ILabelValue<number | string>[] => {
    const result: ILabelValue<number | string>[] = [];
    (values ?? []).forEach((i) => {
      const itemValue = normalizeValue(i.value);
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

  if (readOnly === true) {
    const displayValue: unknown = mode === 'multiple'
      ? displayStyle === 'tags'
        ? (Array.isArray(selectedValue) ? selectedValue : []).map((x) => options.find((o) => o.value === x))
        : getSelectValue()
      : options.find((o) => o.value === selectedValue);

    // Read-only Placeholder: shown instead of an empty rendering when nothing is selected.
    const isEmpty = Array.isArray(displayValue) ? displayValue.length === 0 : !isDefined(displayValue);
    if (isEmpty && isNotNullOrWhiteSpace(readOnlyPlaceholder)) {
      return (
        <ReadOnlyDisplayFormItem
          style={style}
          styleValue={styleValue}
          enableFullStyle={enableStyleOnReadonly}
          className={className}
          value={readOnlyPlaceholder}
        />
      );
    }

    return (
      <ReadOnlyDisplayFormItem
        showIcon={showIcon}
        tagVariant={tagVariant}
        showItemName={showItemName}
        tagStyle={tagStyle}
        style={style}
        styleValue={styleValue}
        enableFullStyle={enableStyleOnReadonly}
        className={className}
        dropdownDisplayMode={displayStyle === 'tags' ? 'tags' : 'raw'}
        type={mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
        value={displayValue}
      />
    );
  }

  if (mode !== 'multiple' && mode !== 'tags' && displayStyle === 'tags') {
    return (
      <Select
        ref={selectRef}
        {...events}
        className={selectClassName}
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
                variant={tagVariant}
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
      ref={selectRef}
      {...events}
      className={selectClassName}
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
        /* Single-select renders the selection through `labelRender`; multi-select renders each
           selected item through `tagRender` instead. Supplying only `labelRender` left multi-select
           on antd's default tag, which shows the remove icon but none of the item's label or icon. */
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
                variant={tagVariant}
                showItemName={showItemName}
                label={option.label}
              />
            )
            : undefined;
        },
        tagRender: (props) => {
          const option = options.find((o) => o.value === props.value);
          return (
            <ReflistTag
              value={option?.value}
              description={option?.description}
              color={option?.color}
              icon={option?.icon}
              showIcon={showIcon}
              tagStyle={tagStyle}
              variant={tagVariant}
              showItemName={showItemName}
              label={option?.label ?? props.label}
              closable={props.closable}
              onClose={props.onClose}
            />
          );
        },
      } : {})}
      options={options.map(({ value: localValue, label }) => ({ value: localValue, label }))}
    />
  );
};
