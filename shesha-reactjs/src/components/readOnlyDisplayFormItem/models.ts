import { ReactNode } from 'react';
import { FormIdentifier } from '@/providers/form/models';
import { SwitchSize } from 'antd/es/switch';

export interface IReadOnlyDisplayFormItemProps<TValue = unknown> {
  value?: TValue | undefined;
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
  dropdownDisplayMode?: 'raw' | 'tags' | undefined;
  showIcon?: boolean | undefined;
  solidColor?: boolean | undefined;
  showItemName?: boolean | undefined;
  dateFormat?: string | undefined;
  timeFormat?: string | undefined;
  quickviewEnabled?: boolean | undefined;
  quickviewFormPath?: FormIdentifier | undefined;
  quickviewDisplayPropertyName?: string | undefined;
  quickviewGetEntityUrl?: string | undefined;
  quickviewWidth?: number | string | undefined;
  style?: React.CSSProperties | undefined;
  tagStyle?: React.CSSProperties | undefined;
  size?: SwitchSize | undefined;
}
