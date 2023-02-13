import React, { FC } from 'react';
import { GenericRefListDropDown } from './genericRefListDropDown';
import { ReferenceListItemDto } from '../../apis/referenceList';
import { IRefListDropDownProps, ISelectOption } from './models';

export const RawRefListDropDown: FC<IRefListDropDownProps> = (props) => {

  const getOptionFromFetchedItem = (fetchedItem: ReferenceListItemDto): ISelectOption<number> => {
    return {
      value: fetchedItem.itemValue || undefined,
      label: fetchedItem.item,
      data: fetchedItem.itemValue,
    };
  }

  const getLabeledValue = (itemValue: number, options: ISelectOption<number>[]) => {
    if (itemValue === undefined)
      return undefined;
    const item = options?.find(i => i.value === itemValue);
    return {
      value: itemValue,
      label: item?.label ?? 'unknown',
      data: itemValue,
    }
  }

  return (
    <GenericRefListDropDown<number>
      getOptionFromFetchedItem={getOptionFromFetchedItem}
      getLabeledValue={getLabeledValue}
      {...props}
    />
  );
}