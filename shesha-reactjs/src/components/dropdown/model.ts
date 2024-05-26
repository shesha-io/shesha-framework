import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { SizeType } from 'antd/es/config-provider/SizeContext';

export type DataSourceType = 'values' | 'referenceList' | 'url';

export interface ILabelValue<TValue = any> {
  id: string;
  label: string;
  value: TValue;
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
  ignoredValues?: number[];
  disableItemValue?: boolean;
  placeholder?: string;
  filters?: number[];
  valueFormat?: 'simple' | 'listItem' | 'custom';
  incomeCustomJs?: string;
  outcomeCustomJs?: string;
  labelCustomJs?: string;

  defaultValue?: any;
  size?: SizeType;
  style?: React.CSSProperties;
  readOnly?: boolean;
}
