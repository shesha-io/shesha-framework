import * as React from 'react';
import type { PickerProps, RangePickerProps } from 'antd/es/date-picker/generatePicker/interface';
import type { Moment } from 'moment';
import { DatePicker } from './datepicker';

export type TimePickerProps = Omit<PickerProps<Moment>, 'picker'>;

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
  <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

TimePicker.displayName = 'TimePicker';

export type TimePickerRangeProps = Omit<RangePickerProps<Moment>, 'picker'>;
const TimeRangePicker = React.forwardRef<any, TimePickerRangeProps>((props, ref) => (
  <DatePicker.RangePicker {...props} picker="time" mode={undefined} ref={ref} />
));
TimeRangePicker.displayName = 'TimeRangePicker';

type TimeSteps = Pick<RangePickerProps<Moment>, 'hourStep' | 'minuteStep' | 'secondStep'>;

export { TimePicker, TimeRangePicker, type TimeSteps };
