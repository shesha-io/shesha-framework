import { IConfigurableFormComponent } from '../../providers/form/models';

export type RangeType = 'start' | 'end';

export interface IRangeInfo {
  range: RangeType;
}

export type RangeValue = [moment.Moment, moment.Moment];

export type TimePickerChangeEvent = (value: any | null, dateString: string) => void;
export type RangePickerChangeEvent = (values: any, formatString: [string, string]) => void;

export interface IDateFieldProps extends IConfigurableFormComponent {
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
  dateOnly?: boolean;
  resolveToUTC?: boolean;
  picker?: 'time' | 'date' | 'week' | 'month' | 'quarter' | 'year';
  disablePastDates?: boolean;
  onChange?: TimePickerChangeEvent | RangePickerChangeEvent;
  disabledDateMode?: 'none' | 'functionTemplate' | 'customFunction';
  disabledDateTemplate?: string;
  disabledDateFunc?: string;
}
