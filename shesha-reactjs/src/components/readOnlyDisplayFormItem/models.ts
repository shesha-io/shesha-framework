import { ReactNode } from 'react';
import { FormIdentifier, IStyleValue } from '@/providers/form/models';
import { SwitchSize } from 'antd/es/switch';
import { TagVariant } from '@/components/dropdown/model';

export type ReadOnlyItemType = 'string' | 'number' | 'dropdown' | 'dropdownMultiple' | 'time' | 'datetime' | 'checkbox' | 'switch' | 'radiogroup' | 'textArea';

export interface IReadOnlyDisplayFormItemProps<TValue = unknown> {
  value?: TValue | undefined;
  render?: (() => ReactNode) | ReactNode | undefined;
  type?: ReadOnlyItemType | undefined;
  dropdownDisplayMode?: 'raw' | 'tags' | undefined;
  showIcon?: boolean | undefined;
  /** How each tag is filled. */
  tagVariant?: TagVariant | undefined;
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
  /**
   * Emotion class from the caller's Appearance settings, applied to the tag wrapper so read-only
   * tags pick up the same per-tag CSS as the editable control rather than needing `tagStyle`.
   */
  className?: string | undefined;
}
