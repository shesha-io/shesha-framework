import { Empty, Select, SelectProps, Spin } from 'antd';
import { ValidationErrors } from '@/components/validationErrors';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import React, { useCallback, useMemo } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { CustomLabeledValue, IGenericRefListDropDownProps, ISelectOption } from './models';
import ReflistTag from './reflistTag';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined } from '@/utils/nullables';

const parseDisabledValues = (input: number[] | string | undefined): number[] => {
  if (!isDefined(input))
    return [];

  if (Array.isArray(input))
    return input.map(Number); // Ensure it's an array of numbers
  return String(input)
    .split(',')
    .map((val) => Number(val.trim()))
    .filter((num) => !isNaN(num)); // Remove invalid values
};

export const GenericRefListDropDown = <TValue = unknown>(props: IGenericRefListDropDownProps<TValue>): React.JSX.Element => {
  const {
    referenceListId,
    value,
    filters,
    disabledValues,
    mode,
    onChange,
    readOnly,
    disabled,
    style,
    allowClear = true,
    getLabeledValue,
    getOptionFromFetchedItem,
    filterOption,
    displayStyle,
    tagStyle,
    showIcon,
    solidColor,
    showItemName,
    placeholder,
    size,
    variant,
    className,
  } = props;
  const { data: refList, loading: refListLoading, error: refListError } = useReferenceList(referenceListId);

  const filter = useCallback(({ itemValue }: ReferenceListItemDto): boolean => {
    return !isNonEmptyArray(filters) || !filters.includes(itemValue);
  }, [filters]);

  const wrapValue = useCallback((localValue: TValue | TValue[] | undefined, allOptions: ISelectOption<TValue>[]): CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[] | undefined => {
    if (!isDefined(localValue))
      return mode === 'multiple'
        ? []
        : undefined;

    if (mode === 'multiple') {
      const allItems = Array.isArray(localValue) ? localValue : [localValue];
      return allItems.map<CustomLabeledValue<TValue> | undefined>((o) => {
        return getLabeledValue(o, allOptions);
      }).filter(isDefined);
    } else
      return !Array.isArray(localValue)
        ? getLabeledValue(localValue, allOptions)
        : undefined;
  }, [getLabeledValue, mode]);

  const disableValue = useCallback((item: ISelectOption<TValue>): ISelectOption<TValue> => {
    const parsedDisabledValues = parseDisabledValues(disabledValues);

    return {
      ...item,
      disabled: parsedDisabledValues.includes(Number(item.value)),
    };
  }, [disabledValues]);

  const options = useMemo<ISelectOption<TValue>[]>(() => {
    const fetchedData = (refList?.items || []).filter(filter);

    const fetchedItems = fetchedData.map<ISelectOption<TValue>>((item) => getOptionFromFetchedItem(item, undefined));

    const selectedItem = wrapValue(value, fetchedItems);
    // Remove items which are already exist in the fetched items.
    // Note: we shouldn't process full list and make it unique because by this way we'll hide duplicates received from the back-end
    const selectedItems = isDefined(selectedItem)
      ? (Array.isArray(selectedItem) ? selectedItem : [selectedItem])
        .filter((i) => fetchedItems.findIndex((fi) => String(fi.value) === String(i.value)) === -1)
      : [];

    const result = [...fetchedItems, ...selectedItems] as ISelectOption<TValue>[];

    return disabledValues ? result.map(disableValue) : result;
  }, [refList?.items, filter, wrapValue, value, disabledValues, disableValue, getOptionFromFetchedItem]);

  const handleChange: SelectProps['onChange'] = (_, option): void => {
    if (!isDefined(onChange))
      return;
    const selectedValue =
      option !== undefined
        ? Array.isArray(option)
          ? (option as ISelectOption<TValue>[]).map((o) => o.data)
          : (option as ISelectOption<TValue>).data
        : undefined;

    if (isDefined(selectedValue)) {
      if (mode === 'multiple') {
        onChange(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
      } else onChange(selectedValue);
    } else
      onChange(undefined);
  };

  if (readOnly) {
    return (
      <ReadOnlyDisplayFormItem
        value={wrapValue(value, options)}
        showIcon={showIcon}
        showItemName={showItemName}
        solidColor={solidColor}
        tagStyle={tagStyle}
        style={style}
        dropdownDisplayMode={displayStyle === 'tags' ? 'tags' : 'raw'}
        type={mode === 'multiple' ? 'dropdownMultiple' : 'dropdown'}
      />
    );
  }

  const commonSelectProps: Partial<SelectProps> = {
    labelInValue: true,
    defaultActiveFirstOption: false,
    notFoundContent: refListLoading ? (
      <Spin />
    ) : (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={refListError ? <ValidationErrors renderMode="raw" error={refListError} /> : 'No matches'}
      />
    ),
    allowClear,
    loading: refListLoading,
    disabled: disabled ?? false,
    filterOption: filterOption,
    size: size,
    ...(variant ? { variant } : {}),
    ...(className ? { className } : {}),
    onChange: handleChange,
    value: wrapValue(value, options),
  };

  if (mode !== 'multiple' && mode !== 'tags' && displayStyle === 'tags') {
    return (
      <Select<CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[]>
        {...commonSelectProps}
        popupMatchSelectWidth={false}
        style={{ width: 'max-content', height: 'max-content' }}
        placeholder={placeholder}
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
        options={options.map(({ value: localValue, label, data, disabled }) => ({ value: localValue, label, data, disabled: disabled ?? false }))}
      />
    );
  }

  return (
    <Select<CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[]>
      {...commonSelectProps}
      style={{ ...style }}
      showSearch
      {...(mode ? { mode } : {})}
      placeholder={placeholder}
      {...(displayStyle === 'tags' ? {
        labelRender: (props) => {
          const option = options.find((o) => o.value === props.value);
          return (
            <ReflistTag
              value={option?.value}
              description={option?.description}
              color={option?.color}
              icon={option?.icon}
              showIcon={showIcon}
              tagStyle={tagStyle}
              solidColor={solidColor}
              showItemName={showItemName}
              label={option?.label}
            />
          );
        },
      } : {})}
      options={options.map(({ value: localValue, label, data, disabled }) => ({ value: localValue, label, data, disabled: disabled ?? false }))}
    />
  );
};

export default GenericRefListDropDown;
