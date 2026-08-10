import { ReferenceListItemDto } from '@/apis/referenceList';
import GenericRefListDropDown from '@/components/refListDropDown/genericRefListDropDown';
import { GetLabeledValueFunc, IGenericRefListDropDownProps, ISelectOption } from '@/components/refListDropDown/models';
import React, { ReactNode } from 'react';

export type IRefListSimpleDropdownProps<TValue = unknown> = Pick<IGenericRefListDropDownProps<TValue>, 'onChange' | 'referenceListId' | 'style' | 'size' | 'value' | 'readOnly'>;

const getOptionFromFetchedItem = (fetchedItem: ReferenceListItemDto): ISelectOption<number> => {
  const label = fetchedItem.item;
  const value = fetchedItem.itemValue;

  return {
    value,
    label: label ?? "",
    data: value,
  };
};

const getLabeledValue: GetLabeledValueFunc<number> = (value, options) => {
  const item = options.find((i) => i.value === value);
  return {
    value: value,
    label: item?.label ?? 'unknown',
    data: item?.data ?? value,
  };
};

export const RefListSimpleDropdown = (props: IRefListSimpleDropdownProps<number>): ReactNode => {
  const { value, onChange, referenceListId, style, size, readOnly } = props;

  return (
    <GenericRefListDropDown<number>
      value={value}
      onChange={onChange}
      referenceListId={referenceListId}
      style={style}
      size={size}
      readOnly={readOnly}
      getLabeledValue={getLabeledValue}
      getOptionFromFetchedItem={getOptionFromFetchedItem}
    />
  );
};
