import { IStyleType } from '@/index';
import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { SizeType } from 'antd/es/config-provider/SizeContext';
import { CSSProperties } from 'react';

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = any> {
  id: string;
  label: string;
  value: TValue;
  color?: string;
  icon?: string;
  description?: string;
}

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
  referenceListName?: string;
  referenceListId?: IReferenceListIdentifier;
  value?: any;
  onChange?: any;
  hideBorder?: boolean;
  allowClear?: boolean;
  mode?: 'single' | 'multiple' | 'tags';
  tag?: IStyleType;
  ignoredValues?: number[];
  placeholder?: string;
  disabledValues?: number[];
  disableItemValue?: boolean;
  valueFormat?: 'simple' | 'listItem' | 'custom';
  incomeCustomJs?: string;
  outcomeCustomJs?: string;
  labelCustomJs?: string;

  defaultValue?: any;
  size?: SizeType;
  style?: React.CSSProperties;
  tagStyle?: CSSProperties;
  readOnly?: boolean;
  displayStyle?: 'text' | 'tags';
  showItemName?: boolean;
  showIcon?: boolean;
  solidColor?: boolean;
}
