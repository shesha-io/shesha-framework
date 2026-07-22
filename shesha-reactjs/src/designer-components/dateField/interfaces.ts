import { DatePickerFocusEventHandler } from '@/components/antd/datepicker';
import { ComponentDefinition } from '@/interfaces';
import { IConfigurableFormComponent, IInputStyles } from '@/providers/form/models';
import { CSSProperties } from 'react';

export type RangeType = 'start' | 'end';

export interface IRangeInfo {
  range: RangeType;
}

export type NoUndefinedRangeValueType<DateType> = [start: DateType | null, end: DateType | null];
export type RangeValue = [moment.Moment, moment.Moment];

export type TimePickerChangeEvent = (value: string | null, dateString: string | null) => void;
export type RangePickerChangeEvent = (values: NoUndefinedRangeValueType<string> | null, formatString: [string, string]) => void;

export type DisabledDateTemplate = 'disabledPastTime' | 'disableFutureTime';

export type DateFieldValueType = string | NoUndefinedRangeValueType<string> | null;

export interface IDateFieldProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string | undefined;
  dateFormat?: string | undefined;
  value?: DateFieldValueType | undefined;
  hideBorder?: boolean | undefined;
  showTime?: boolean | undefined;
  showNow?: boolean | undefined;
  defaultToMidnight?: boolean | undefined;
  showToday?: boolean | undefined;
  timeFormat?: string | undefined;
  yearFormat?: string | undefined;
  quarterFormat?: string | undefined;
  monthFormat?: string | undefined;
  weekFormat?: string | undefined;
  range?: boolean | undefined;
  resolveToUTC?: boolean | undefined;
  picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined;
  disablePastDates?: boolean | undefined;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent | undefined;
  disabledDateMode?: 'none' | 'functionTemplate' | 'customFunction' | undefined;
  disabledDateTemplate?: string | undefined;
  disabledDateFunc?: string | undefined;
  disabledTimeMode?: 'none' | 'timeFunctionTemplate' | 'customTimeFunction' | undefined;
  disabledTimeTemplate?: DisabledDateTemplate | undefined;
  disabledTimeFunc?: string | undefined;
  additionalStyles?: CSSProperties | undefined;

  onFocus?: DatePickerFocusEventHandler | undefined;
  onBlur?: DatePickerFocusEventHandler | undefined;
}

export type DateFieldDefinition = ComponentDefinition<"dateField", IDateFieldProps>;
