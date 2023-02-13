import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { IReadOnly } from './../../interfaces/readOnly';
import { LabeledValue, SelectProps } from 'antd/lib/select';
import { Key, CSSProperties } from 'react';
import { ReferenceListItemDto } from '../../apis/referenceList';
import { IReferenceListIdentifier } from '../../providers/referenceListDispatcher/models';

export interface IGenericRefListDropDownProps<TValue = any> extends IRefListDropDownProps<TValue> {
  /**
   * Get CustomLabeledValue from value
   */
  getLabeledValue: (value: TValue, options: ISelectOption<TValue>[]) => CustomLabeledValue<TValue>;

  /**
   * Get option from an item fetched from the back-end
   */
  getOptionFromFetchedItem: (fetchedItem: ReferenceListItemDto) => ISelectOption<TValue>;
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
  includeFilters?: boolean;
  width?: number;
  style?: CSSProperties;
  base?: string;
  value?: TValue | TValue[];
  ignoredValues?: number[];
  size?: SizeType;
  onChange?: (value: TValue | TValue[]) => void;
}

export interface IRefListDropDownOption {
  children?: string;
  key: string;
  value?: Key;
}

export interface ISelectOption<TValue = any> {
  // todo: make generic
  value: string | number;
  label: string | React.ReactNode;
  data: TValue;
}

export type CustomLabeledValue<TValue = any> = LabeledValue & { data: TValue };
