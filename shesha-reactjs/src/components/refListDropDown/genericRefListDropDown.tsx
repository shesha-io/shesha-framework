import { Empty, Select, Spin } from 'antd';
import { ValidationErrors } from '@/components';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import React, { useMemo } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { CustomLabeledValue, IGenericRefListDropDownProps, ISelectOption } from './models';

// tslint:disable-next-line:whitespace
export const GenericRefListDropDown = <TValue,>(props: IGenericRefListDropDownProps<TValue>) => {
  const {
    referenceListId,
    showArrow = true,
    value,
    filters,
    disabledValues,
    width,
    base,
    mode,
    onChange,
    readOnly,
    disabled,
    style,
    allowClear = true,
    getLabeledValue,
    getOptionFromFetchedItem,
    incomeValueFunc,
    outcomeValueFunc,
    ...rest
  } = props;
  const { data: refList, loading: refListLoading, error: refListError } = useReferenceList(referenceListId);

  const filter = ({ itemValue }: ReferenceListItemDto) => {
    if (!filters?.length) {
      return true;
    }

    const filtered = filters?.includes(itemValue);

    return !filtered;
  };

  const wrapValue = (
    localValue: TValue | TValue[],
    allOptions: ISelectOption<TValue>[]
  ): CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[] => {
    if (localValue === undefined) return mode === 'multiple' || mode === 'tags' ? [] : undefined;
    if (mode === 'multiple' || mode === 'tags') {
      return Array.isArray(localValue)
        ? (localValue as TValue[]).map<CustomLabeledValue<TValue>>((o) => {
          return getLabeledValue(o, allOptions);
        })
        : [getLabeledValue(localValue as TValue, allOptions)];
    } else return getLabeledValue(localValue as TValue, allOptions);
  };

  const parseDisabledValues = (input) => {
    if (!input) return []; // Handle empty input
    if (Array.isArray(input)) return input.map(Number); // Ensure it's an array of numbers
    return String(input)
      .split(',')
      .map((val) => Number(val.trim()))
      .filter((num) => !isNaN(num)); // Remove invalid values
  };

  const disableValue = (item, index) => {
    const parsedDisabledValues = parseDisabledValues(disabledValues);

    return {
      ...item,
      disabled: parsedDisabledValues.includes(index),
    };
  };

  const options = useMemo<ISelectOption<TValue>[]>(() => {
    const fetchedData = (refList?.items || []).filter(filter);

    const fetchedItems = fetchedData.map<ISelectOption<TValue>>((item) => {
      const option = Boolean(getOptionFromFetchedItem)
        ? (getOptionFromFetchedItem(item) as ISelectOption<TValue>)
        : (item as ISelectOption<TValue>);

      return option;
    });

    const selectedItem = wrapValue(value, fetchedItems);
    // Remove items which are already exist in the fetched items.
    // Note: we shouldn't process full list and make it unique because by this way we'll hide duplicates received from the back-end
    const selectedItems = selectedItem
      ? (Array.isArray(selectedItem) ? selectedItem : [selectedItem]).filter(
        (i) => fetchedItems.findIndex((fi) => String(fi.value) === String(i.value)) === -1
      )
      : [];

    const result = [...fetchedItems, ...selectedItems];

    return disabledValues ? result.map(disableValue) : result;
  }, [refList, getLabeledValue, getOptionFromFetchedItem, incomeValueFunc, outcomeValueFunc, disabledValues]);

  const handleChange = (_: CustomLabeledValue<TValue>, option: any) => {
    if (!Boolean(onChange)) return;
    const selectedValue =
      option !== undefined
        ? Array.isArray(option)
          ? (option as ISelectOption<TValue>[]).map((o) => o.data)
          : (option as ISelectOption<TValue>).data
        : undefined;

    if (mode === 'multiple' || mode === 'tags') {
      onChange(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
    } else onChange(selectedValue);
  };

  if (readOnly) {
    return (
      <ReadOnlyDisplayFormItem
        value={wrapValue(value, options)}
        disabled={disabled}
        type={mode === 'multiple' || mode === 'tags' ? 'dropdownMultiple' : 'dropdown'}
      />
    );
  }

  return (
    <Select<CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[]>
      className="sha-dropdown"
      showSearch
      labelInValue={true}
      defaultActiveFirstOption={false}
      suffixIcon={showArrow ? undefined : null}
      notFoundContent={
        refListLoading ? (
          <Spin />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={refListError ? <ValidationErrors renderMode="raw" error={refListError} /> : 'No matches'}
          />
        )
      }
      allowClear={allowClear}
      loading={refListLoading}
      disabled={disabled}
      filterOption={(input, option) => {
        if (typeof option?.children === 'string' && typeof input === 'string') {
          // @ts-ignore
          return option?.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0;
        }

        return false;
      }}
      {...rest}
      onChange={handleChange}
      value={wrapValue(value, options)}
      style={{ ...style }}
      mode={mode}
    >
      {options?.map(({ value: localValue, label, data, disabled }, index) => (
        <Select.Option value={localValue} key={index} data={data} disabled={disabled}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default GenericRefListDropDown;
