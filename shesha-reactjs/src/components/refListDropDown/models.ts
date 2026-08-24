import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { BaseOptionType, LabeledValue, SelectProps } from 'antd/lib/select';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties, Key, Ref } from 'react';
import { DropdownSelectRef, SelectEventHandlers, TagVariant } from '@/components/dropdown/model';
import { IStyleValue } from '@/providers/form/models';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { IReadOnly } from '@/interfaces/readOnly';
import { IAnyObject } from '@/interfaces';

type RefListItemAndValue = Pick<ReferenceListItemDto, "item" | "itemValue">;
export type IncomeValueFunc = (value: RefListItemAndValue, args: IAnyObject | undefined) => string | number | RefListItemAndValue | null;
/** `string` covers the Item Label binding format, which stores the item's display text. */
export type OutcomeValueFunc = (value: ReferenceListItemDto, args: IAnyObject | undefined) => string | number | RefListItemAndValue | null;
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
   * Emotion class for the option list, which antd portals outside the select so it cannot be reached
   * from `className`. Built by the caller, like `className`.
   */
  popupClassName?: string | undefined;
  /**
   * Reference List identifier
   */
  referenceListId: IReferenceListIdentifier;
  filters?: number[] | undefined;
  style?: CSSProperties | undefined;
  tagStyle?: CSSProperties | undefined;
  showIcon?: boolean | undefined;
  /** How each tag is filled. */
  tagVariant?: TagVariant;
  showItemName?: boolean | undefined;
  value?: TValue | TValue[] | (TValue extends unknown ? TValue | TValue[] : never) | undefined;
  ignoredValues?: number[] | undefined;
  disabledValues?: number[] | undefined;
  size?: SizeType | undefined;
  displayStyle?: 'tags' | 'text' | undefined;
  onChange?: ((value: TValue | TValue[] | (TValue extends unknown ? TValue | TValue[] : never) | undefined) => void) | undefined;
  enableStyleOnReadonly?: boolean | undefined;
  /** Forwarded to the underlying antd `Select` so callers can expose `focus()` on their API. */
  selectRef?: Ref<DropdownSelectRef | null> | undefined;
  /** Standard DOM event handlers, supplied by `getComponentEvents`. */
  events?: SelectEventHandlers | undefined;
  /** Appearance style model, used only by the read-only renderer. See `IDropdownProps.styleValue`. */
  styleValue?: IStyleValue | undefined;
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
