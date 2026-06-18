import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { BaseOptionType, LabeledValue, SelectProps } from 'antd/lib/select';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties, Key } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { IReadOnly } from '@/interfaces/readOnly';
import { IAnyObject } from '@/interfaces';

type RefListItemAndValue = Pick<ReferenceListItemDto, "item" | "itemValue">;
export type IncomeValueFunc = (value: RefListItemAndValue, args: IAnyObject | undefined) => string | number | RefListItemAndValue | null;
export type OutcomeValueFunc = (value: ReferenceListItemDto, args: IAnyObject | undefined) => number | RefListItemAndValue | null;
export type GetLabeledValueFunc<TValue = unknown> = (value: TValue, options: ISelectOption<TValue>[]) => CustomLabeledValue<TValue> | undefined;
export type GetOptionFromFetchedItemFunc<TValue = unknown> = (fetchedItem: ReferenceListItemDto, args: IAnyObject | undefined) => ISelectOption<TValue>;

export interface IGenericRefListDropDownProps<TValue = unknown> extends IRefListDropDownProps<TValue> {
  /**
   * Get CustomLabeledValue from value
   */
  getLabeledValue: GetLabeledValueFunc<TValue>;

  /**
   * Get option from an item fetched from the back-end
   */
  getOptionFromFetchedItem: GetOptionFromFetchedItemFunc<TValue>;
}

type LimitedSelectProps<TValue = unknown> = Pick<SelectProps<TValue>, 'mode' | 'disabled' | 'allowClear' | 'filterOption' | 'placeholder' | 'variant' | 'className'>;

export interface IRefListDropDownProps<TValue = unknown> extends LimitedSelectProps<TValue>, IReadOnly {
  /**
   * Reference List identifier
   */
  referenceListId: IReferenceListIdentifier;
  filters?: number[] | undefined;
  style?: CSSProperties | undefined;
  tagStyle?: CSSProperties | undefined;
  showIcon?: boolean | undefined;
  solidColor?: boolean | undefined;
  showItemName?: boolean | undefined;
  value?: TValue | TValue[] | undefined;
  ignoredValues?: number[] | undefined;
  disabledValues?: number[] | undefined;
  size?: SizeType | undefined;
  displayStyle?: 'tags' | 'text' | undefined;
  onChange?: ((value: TValue | TValue[] | undefined) => void) | undefined;
  enableStyleOnReadonly?: boolean | undefined;
}

export interface IRefListDropDownOption {
  children?: string;
  key: string;
  value?: Key;
}

export interface ISelectOption<TValue = unknown> extends BaseOptionType {
  // TODO: make generic
  value: string | number;
  label: string;
  data: TValue;
  // disabled?: boolean | undefined;
  color?: string | undefined;
  icon?: string | undefined;
  description?: string | undefined;
}

export type CustomLabeledValue<TValue = unknown> = LabeledValue & { data: TValue };
