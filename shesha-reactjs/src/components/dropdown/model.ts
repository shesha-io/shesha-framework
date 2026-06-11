import { IStyleType } from "@/providers/form/models";
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { CSSProperties } from 'react';

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = unknown> {
  id: string;
  label: string;
  value: TValue;
  color?: string;
  icon?: string;
  description?: string;
}

export type DropdownValueFormat = 'simple' | 'listItem' | 'custom';

export interface IDropdownProps {
  dataSourceType: DataSourceType;
  values?: ILabelValue[];
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListNamespace?: string;
  /**
   * @deprecated - use referenceListId instead
   */
  referenceListName?: string | undefined;
  referenceListId?: IReferenceListIdentifier | undefined;
  value?: number | number[] | undefined;
  onChange?: ((value: number | number[] | undefined) => void) | undefined;
  hideBorder?: boolean | undefined;
  allowClear?: boolean | undefined;
  mode?: 'single' | 'multiple' | 'tags' | undefined;
  tag?: IStyleType | undefined;
  ignoredValues?: number[] | undefined;
  placeholder?: string | undefined;
  disabledValues?: number[] | undefined;
  disableItemValue?: boolean | undefined;
  valueFormat?: DropdownValueFormat | undefined;
  incomeCustomJs?: string | undefined;
  outcomeCustomJs?: string | undefined;
  labelCustomJs?: string | undefined;
  size?: SizeType | undefined;
  style?: React.CSSProperties | undefined;
  tagStyle?: CSSProperties | undefined;
  readOnly?: boolean | undefined;
  displayStyle?: 'text' | 'tags' | undefined;
  showItemName?: boolean | undefined;
  showIcon?: boolean | undefined;
  solidColor?: boolean | undefined;
  enableStyleOnReadonly?: boolean | undefined;
}
