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

/**
 * What the user picks, and at what precision. Replaces the old `picker` + `showTime` pair: those two
 * could express contradictory combinations (`picker: 'year'` with `showTime: true`), whereas each
 * value here maps to exactly one antd picker and one time precision.
 */
export type DateSelectionType =
  | 'dateTimeHours' |
  'dateTimeMinutes' |
  'dateTimeSeconds' |
  'date' |
  'week' |
  'month' |
  'quarter' |
  'year';

/** How the selected date is serialised into the form data. */
export type DateBindingFormat =
  | 'utc' |
  'isoLocal' |
  'isoOffset' |
  'dateOnly' |
  'ticks' |
  'unix';

/** Granularity of the minute column in the time picker. Only meaningful for date+time selections. */
export type MinuteStep = 1 | 5 | 10 | 15 | 20 | 30;

export type DateRestriction = 'none' | 'past' | 'future';

export interface IDateFieldProps extends IConfigurableFormComponent, IInputStyles {
  placeholder?: string | undefined;
  dateFormat?: string | undefined;
  value?: DateFieldValueType | undefined;
  hideBorder?: boolean | undefined;

  /** Single source of truth for picker granularity. Derives `picker`/`showTime` at runtime. */
  selectionType?: DateSelectionType | undefined;
  /** Serialisation format of the bound value. */
  bindingFormat?: DateBindingFormat | undefined;
  /** Property the range end binds to. Only used when `range` is enabled. */
  toPropertyName?: string | undefined;
  /** Minute column granularity; only applied when the selection type includes minutes. */
  minuteStep?: MinuteStep | undefined;

  defaultToMidnight?: boolean | undefined;
  showNow?: boolean | undefined;
  timeFormat?: string | undefined;
  yearFormat?: string | undefined;
  quarterFormat?: string | undefined;
  monthFormat?: string | undefined;
  weekFormat?: string | undefined;
  range?: boolean | undefined;
  resolveToUTC?: boolean | undefined;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent | undefined;

  /** Date restriction, promoted to the Common tab. `disabledDateMode` is its legacy predecessor. */
  dateRestriction?: DateRestriction | undefined;
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

/**
 * Pre-refactor shape. Kept so the early migrator steps stay typed against the model they actually
 * received: `picker` and `showTime` are gone from `IDateFieldProps`, but old saved forms still carry
 * them and step 8 is what folds them into `selectionType`.
 */
export interface IDateFieldPropsV1 extends Omit<IDateFieldProps, 'selectionType'> {
  picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year' | undefined;
  showTime?: boolean | undefined;
  showToday?: boolean | undefined;
  selectionType?: DateSelectionType | undefined;
}

export type DateFieldDefinition = ComponentDefinition<"dateField", IDateFieldProps>;
