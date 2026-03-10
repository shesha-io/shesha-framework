import { ReactNode } from 'react';
import { FormIdentifier } from '@/providers/form/models';
import { SwitchSize } from 'antd/es/switch';

export interface IReadOnlyDisplayFormItemProps {
  value?: any;
  render?: () => ReactNode | ReactNode;
  type?:
    | 'string' |
    'number' |
    'dropdown' |
    'dropdownMultiple' |
    'time' |
    'datetime' |
    'checkbox' |
    'switch' |
    'radiogroup' |
    'textArea';
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
  quickviewWidth?: number | string;
  style?: React.CSSProperties;
  tagStyle?: React.CSSProperties;
  size?: SwitchSize;
}
