import { ReactNode } from 'react';
import { FormIdentifier } from '@/providers/form/models';

export interface IReadOnlyDisplayFormItemProps {
  value?: any;
  render?: () => ReactNode | ReactNode;
  type?:
  | 'string'
  | 'number'
  | 'dropdown'
  | 'dropdownMultiple'
  | 'time'
  | 'datetime'
  | 'checkbox'
  | 'switch'
  | 'radiogroup';
  dropdownDisplayMode?: 'raw' | 'tags';
  showIcon?: boolean;
  solidColor?: boolean;
  showItemName?: boolean;
  dateFormat?: string;
  timeFormat?: string;
  disabled?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  quickviewEnabled?: boolean;
  quickviewFormPath?: FormIdentifier;
  quickviewDisplayPropertyName?: string;
  quickviewGetEntityUrl?: string;
  quickviewWidth?: number;
  style?: React.CSSProperties;
}
