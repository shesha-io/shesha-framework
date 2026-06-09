import { ReactNode } from 'react';
import { FormIdentifier, IStyleValue } from '@/providers/form/models';
import { SwitchSize } from 'antd/es/switch';

export type ReadOnlyItemType = 'string' | 'number' | 'dropdown' | 'dropdownMultiple' | 'time' | 'datetime' | 'checkbox' | 'switch' | 'radiogroup' | 'textArea';

export interface IReadOnlyDisplayFormItemProps {
  value?: any | undefined;
  render?: (() => ReactNode) | ReactNode | undefined;
  type?: ReadOnlyItemType | undefined;
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
  styleValue?: IStyleValue | undefined;
  enableFullStyle?: boolean | undefined;
}
