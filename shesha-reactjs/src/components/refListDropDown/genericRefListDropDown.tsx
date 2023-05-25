import React, { useMemo } from 'react';
import { Empty, Select, Spin } from 'antd';
import { ReferenceListItemDto } from 'apis/referenceList';
import { CustomLabeledValue, IGenericRefListDropDownProps, ISelectOption } from './models';
import ReadOnlyDisplayFormItem from '../readOnlyDisplayFormItem';
import { useReferenceList } from 'providers/referenceListDispatcher';
import { ValidationErrors } from 'components';

// tslint:disable-next-line:whitespace
export const GenericRefListDropDown = <TValue,>(props: IGenericRefListDropDownProps<TValue>) => {
  const {
    referenceListId,
    showArrow = true,
    value,
    includeFilters = false,
    filters = [],
    width,
    base,
    mode,
    onChange,
    getLabeledValue,
    getOptionFromFetchedItem,
    readOnly,
    disabled,
    style,
    allowClear = true,
    ...rest
  } = props;
  const { data: refList, loading: refListLoading, error: refListError } = useReferenceList(referenceListId);

  const filter = ({ itemValue }: ReferenceListItemDto) => {
    if (!filters?.length) {
      return true;
    }

    const filtered = filters?.includes(itemValue);

    return includeFilters ? filtered : !filtered;
  };

  const wrapValue = (localValue: TValue | TValue[]): CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[] => {
    if (localValue === undefined) return undefined;
    if (mode === 'multiple' || mode === 'tags') {
      return Array.isArray(localValue)
        ? (localValue as TValue[]).map<CustomLabeledValue<TValue>>(o => {
            return getLabeledValue(o, options);
          })
        : [getLabeledValue(localValue as TValue, options)];
    } else return getLabeledValue(localValue as TValue, options);
  };

  const options = useMemo<ISelectOption<TValue>[]>(() => {
    const fetchedData = (refList?.items || []).filter(filter);

    const fetchedItems = fetchedData.map<ISelectOption<TValue>>(item => {
      const option = Boolean(getOptionFromFetchedItem)
        ? (getOptionFromFetchedItem(item) as ISelectOption<TValue>)
        : (item as ISelectOption<TValue>);

      return option;
    });

    const selectedItem = wrapValue(value);
    // Remove items which are already exist in the fetched items.
    // Note: we shouldn't process full list and make it unique because by this way we'll hide duplicates received from the back-end
    const selectedItems = selectedItem
      ? (Array.isArray(selectedItem) ? selectedItem : [selectedItem]).filter(
          i => fetchedItems.findIndex(fi => String(fi.value) === String(i.value)) === -1
        )
      : [];

    const result = [...fetchedItems, ...selectedItems];
    return result;
  }, [refList]);

  const handleChange = (_: CustomLabeledValue<TValue>, option: any) => {
    if (!Boolean(onChange)) return;
    const selectedValue =
      option !== undefined
        ? Array.isArray(option)
          ? (option as ISelectOption<TValue>[]).map(o => o.data)
          : (option as ISelectOption<TValue>).data
        : undefined;

    if (mode === 'multiple' || mode === 'tags') {
      onChange(Array.isArray(selectedValue) ? selectedValue : [selectedValue]);
    } else onChange(selectedValue);
  };

  if (readOnly) {
    return (
      <ReadOnlyDisplayFormItem
        value={wrapValue(value)}
        disabled={disabled}
        type={mode === 'multiple' || mode === 'tags' ? 'dropdownMultiple' : 'dropdown'}
      />
    );
  }

  return (
    <Select<CustomLabeledValue<TValue> | CustomLabeledValue<TValue>[]>
      showSearch
      labelInValue={true}
      defaultActiveFirstOption={false}
      showArrow={showArrow}
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
      style={{ ...style, width }}
      onChange={handleChange}
      value={wrapValue(value)}
      mode={mode}
    >
      {options?.map(({ value: localValue, label, data }, index) => (
        <Select.Option value={localValue} key={index} data={data}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default GenericRefListDropDown;
