import { ReferenceListItemDto } from '@/apis/referenceList';
import GenericRefListDropDown from '@/components/refListDropDown/genericRefListDropDown';
import { IGenericRefListDropDownProps, IncomeValueFunc, ISelectOption, OutcomeValueFunc } from '@/components/refListDropDown/models';
import React, { FC, useCallback } from 'react';

export type IRefListSimpleDropdownProps = Pick<IGenericRefListDropDownProps, 'onChange' | 'referenceListId' | 'style' | 'size' | 'value' | 'readOnly'>;

export const RefListSimpleDropdown: FC<IRefListSimpleDropdownProps> = (props) => {
  const { value, onChange, referenceListId, style, size, readOnly } = props;

  const incomeValueFunc: IncomeValueFunc = useCallback((value: any, _args?: any) => {
    return value;
  }, []);

  const outcomeValueFunc: OutcomeValueFunc = useCallback((value: ReferenceListItemDto, _args?: any) => {
    return !!value ? value.itemValue : null;
  }, []);

  const getLabeledValue = useCallback((value: any, options: ISelectOption<any>[]) => {
    if (value === undefined)
      return undefined;
    const itemValue = incomeValueFunc(value, {});
    const item = options?.find((i) => i.value === itemValue);
    return {
      // fix for designer when switch mode
      value: typeof itemValue === 'object' ? null : itemValue,
      label: item?.label ?? 'unknown',
      data: item?.data,
    };
  }, [incomeValueFunc]);

  const getOptionFromFetchedItem = useCallback((fetchedItem: ReferenceListItemDto, args?: any): ISelectOption<any> => {
    const label = fetchedItem.item;

    const value = incomeValueFunc(outcomeValueFunc(fetchedItem, args), {});

    return {
      // fix for designer when switch mode
      value: typeof value === 'object' ? null : value,
      label,
      data: outcomeValueFunc(fetchedItem, args),
    };
  }, [outcomeValueFunc, incomeValueFunc]);

  return (
    <GenericRefListDropDown<any>
      value={value}
      onChange={onChange}
      referenceListId={referenceListId}
      style={style}
      size={size}
      readOnly={readOnly}

      getLabeledValue={getLabeledValue}
      getOptionFromFetchedItem={getOptionFromFetchedItem}
      incomeValueFunc={incomeValueFunc}
      outcomeValueFunc={outcomeValueFunc}
    />
  );
};
