import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { LabeledValue, SelectProps } from 'antd/lib/select';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { CSSProperties, Key } from 'react';
import { ReferenceListItemDto } from '@/apis/referenceList';
import { IReadOnly } from '@/interfaces/readOnly';

export type IncomeValueFunc = (value: any, args: any) => string;
export type OutcomeValueFunc = (value: any, args: any) => string | string[] | any;
export type ItemFunc = (value: any, args: any) => ISelectOption<any>;

export interface IGenericRefListDropDownProps<TValue = any> extends IRefListDropDownProps<TValue> {
  /**
   * Get CustomLabeledValue from value
   */
  getLabeledValue: (value: TValue, options: ISelectOption<TValue>[]) => CustomLabeledValue<TValue>;

  /**
   * Get option from an item fetched from the back-end
   */
  getOptionFromFetchedItem: (fetchedItem: ReferenceListItemDto, args?: any) => ISelectOption<TValue>;

  incomeValueFunc: IncomeValueFunc;
  outcomeValueFunc: OutcomeValueFunc;

}

export interface IRefListDropDownProps<TValue = any> extends Omit<SelectProps<any>, 'onChange'>, IReadOnly {
  /**
   * Reference List identifier
   */
  referenceListId: IReferenceListIdentifier;
  /**
   * How large should the button be?
   */
  filters?: number[];
  width?: number;
  style?: CSSProperties;
  tagStyle?: CSSProperties;
  showIcon?: boolean;
  solidColor?: boolean;
  showItemName?: boolean;
  base?: string;
  value?: TValue | TValue[];
  ignoredValues?: number[];
  disabledValues?: number[];
  size?: SizeType;
  displayStyle?: 'tags' | 'text';
  onChange?: (value: TValue | TValue[]) => void;
}

export interface IRefListDropDownOption {
  children?: string;
  key: string;
  value?: Key;
}

export interface ISelectOption<TValue = any> {
  // TODO: make generic
  value: string | number;
  label: string | React.ReactNode;
  data: TValue;
  disabled?: boolean;
  color?: string;
  icon?: string;
  description?: string;
}

export type CustomLabeledValue<TValue = any> = LabeledValue & { data: TValue };
