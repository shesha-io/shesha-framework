import * as React from 'react';
import type { PickerTimeProps, RangePickerTimeProps } from 'antd/es/date-picker/generatePicker';
import type { Moment } from 'moment';
import { DatePicker } from './datepicker';

export interface TimePickerProps extends Omit<PickerTimeProps<Moment>, 'picker'> { }

const TimePicker = React.forwardRef<any, TimePickerProps>((props, ref) => (
    <DatePicker {...props} picker="time" mode={undefined} ref={ref} />
));

TimePicker.displayName = 'TimePicker';

export interface TimePickerRangeProps extends Omit<RangePickerTimeProps<Moment>, 'picker'> { }
const TimeRangePicker = React.forwardRef<any, TimePickerRangeProps>((props, ref) => (
    <DatePicker.RangePicker {...props} picker="time" mode={undefined} ref={ref} />
));

type TimeSteps = Pick<RangePickerTimeProps<Moment>, 'hourStep' | 'minuteStep' | 'secondStep'>;

export { TimePicker, TimeRangePicker, type TimeSteps };