import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { CSSProperties } from 'react';

export type RangeType = 'start' | 'end';

export interface IRangeInfo {
  range: RangeType;
}

export type RangeValue = [moment.Moment, moment.Moment];

export type TimePickerChangeEvent = (value: any | null, dateString: string) => void;
export type RangePickerChangeEvent = (values: any, formatString: [string, string]) => void;

export type DisabledDateTemplate = 'disabledPastTime' | 'disableFutureTime';

export interface IDateFieldProps extends IConfigurableFormComponent, IInputStyles {
  dateFormat?: string;
  value?: any;
  hideBorder?: boolean;
  showTime?: boolean;
  showNow?: boolean;
  defaultToMidnight?: boolean;
  showToday?: boolean;
  timeFormat?: string;
  yearFormat?: string;
  quarterFormat?: string;
  monthFormat?: string;
  weekFormat?: string;
  range?: boolean;
  resolveToUTC?: boolean;
  picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
  disablePastDates?: boolean;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent;
  disabledDateMode?: 'none' | 'functionTemplate' | 'customFunction';
  disabledDateTemplate?: string;
  disabledDateFunc?: string;
  disabledTimeMode?: 'none' | 'timeFunctionTemplate' | 'customTimeFunction';
  disabledTimeTemplate?: DisabledDateTemplate;
  disabledTimeFunc?: string;
  additionalStyles?: CSSProperties;
  /** Script to execute on focus (handled via customDateEventHandler). */
  onFocusCustom?: any;
  /** Script to execute on blur (handled via customDateEventHandler). */
  onBlurCustom?: any;
}
