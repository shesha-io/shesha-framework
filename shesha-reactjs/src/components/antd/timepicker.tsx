import * as React from 'react';
import type { PickerProps, RangePickerProps } from 'antd/es/date-picker/generatePicker/interface';
import type { Moment } from 'moment';
import { DatePicker } from './datepicker';
import { type GetRef } from 'antd';

type OnChangeHandler = (date: Moment | Moment[] | null, dateString: string | string[] | null) => void;

export type TimePickerProps = Omit<PickerProps<Moment>, 'picker' | 'onChange'> & {
  onChange?: OnChangeHandler;
};
type PickerRef = GetRef<typeof DatePicker>; // Resolves to BaseSelectRef

const TimePicker = React.forwardRef<PickerRef, TimePickerProps>((props, ref) => (
  <DatePicker {...props} picker="time" ref={ref} />
));

TimePicker.displayName = 'TimePicker';

export type TimePickerRangeProps = Omit<RangePickerProps<Moment>, 'picker'>;
type RangePickerRef = GetRef<typeof DatePicker.RangePicker>; // Resolves to BaseSelectRef
const TimeRangePicker = React.forwardRef<RangePickerRef, TimePickerRangeProps>((props, ref) => (
  <DatePicker.RangePicker {...props} picker="time" ref={ref} />
));
TimeRangePicker.displayName = 'TimeRangePicker';

type TimeSteps = Pick<RangePickerProps<Moment>, 'hourStep' | 'minuteStep' | 'secondStep'>;

export { TimePicker, TimeRangePicker, type TimeSteps };
