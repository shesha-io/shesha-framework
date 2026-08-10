import React, { FC } from 'react';
import { TimeRangePicker, TimePicker } from '@/components/antd';
import moment, { Moment, isMoment } from 'moment';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { getNumericValue } from '@/utils/string';
import { TimePickerRangeProps, TimeSteps } from '@/components/antd/timepicker';
import { useStyles } from './styles/styles';
import { ITimePickerProps, RangePickerChangeEvent, TimePickerChangeEvent } from './models';

type RangeValue = [moment.Moment, moment.Moment];

const DATE_TIME_FORMAT = 'HH:mm';

const getMoment = (value: unknown, dateFormat: string): Moment | undefined => {
  if (value === null || value === undefined) return undefined;
  const values = [
    isMoment(value) ? value : null,
    typeof (value) === 'number' ? moment.utc(value * 1000) : null, // time in millis
    typeof (value) === 'string' ? moment(value as string) : null,
    typeof (value) === 'string' ? moment(value as string, dateFormat) : null,
  ];
  const parsed = values.find((i) => isMoment(i) && i.isValid());

  return parsed ?? undefined;
};

const getTotalSeconds = (value: Moment | undefined | null): number | undefined => {
  if (!isMoment(value) || !value.isValid())
    return undefined;

  const timeOnly = moment.duration({
    hours: value.hours(),
    minutes: value.minutes(),
    seconds: value.seconds(),
  });
  return timeOnly.asSeconds();
};

export const TimePickerWrapper: FC<ITimePickerProps> = ({
  onChange,
  range,
  value,
  placeholder = "",
  format = DATE_TIME_FORMAT,
  readOnly,
  style,
  hourStep,
  minuteStep,
  secondStep,
  disabled,
  hideBorder,
  showNow = false,
  allowClear = false,
  hideDisabledOptions = false,
  use12Hours = false,
  ...rest
}) => {
  const { styles } = useStyles({ fullStyles: style ?? {} });

  const evaluatedValue = getMoment(value, format) ?? null;

  const hourStepLocal = getNumericValue(hourStep);
  const minuteStepLocal = getNumericValue(minuteStep);
  const secondStepLocal = getNumericValue(secondStep);

  // Should be a factors? if not shouldn't we delete the toolTips
  const steps: TimeSteps = {
    hourStep: 1 <= hourStepLocal && hourStepLocal <= 23 ? hourStepLocal as Required<TimeSteps>['hourStep'] : 1, // value should be in range 1..23
    minuteStep: 1 <= minuteStepLocal && minuteStepLocal <= 59 ? minuteStepLocal as Required<TimeSteps>['minuteStep'] : 1, // value should be in range 1..59
    secondStep: 1 <= secondStepLocal && secondStepLocal <= 59 ? secondStepLocal as Required<TimeSteps>['secondStep'] : 1, // value should be in range 1..59
  };

  const getRangePickerValues = (value: number | [number, number] | undefined): [Moment | null, Moment | null] =>
    Array.isArray(value)
      ? [getMoment(value[0], format) ?? null, getMoment(value[1], format) ?? null]
      : [null, null];

  // onChange?: (date: DateType | DateType[], dateString: string | string[]) => void;
  const handleTimePickerChange = (newValue: Moment | Moment[] | null, timeString: string | string[] | null): void => {
    if (onChange) {
      if (Array.isArray(newValue) || Array.isArray(timeString))
        throw new Error('TimePickerWrapper does not support multiple values');

      const seconds = getTotalSeconds(newValue);
      (onChange as TimePickerChangeEvent)(seconds ?? null, timeString);
    }
  };

  const handleRangePicker: TimePickerRangeProps['onChange'] = (values, timeString): void => {
    if (onChange) {
      const seconds = values?.map((v) => getTotalSeconds(v) ?? null) ?? null;


      (onChange as RangePickerChangeEvent)(seconds, timeString);
    }
  };

  if (readOnly) {
    return <ReadOnlyDisplayFormItem value={evaluatedValue} type="time" timeFormat={format} style={style} />;
  }

  if (range) {
    return (
      <TimeRangePicker
        {...(hideBorder ? { variant: 'borderless' } : {})}
        onChange={handleRangePicker}
        format={format}
        value={getRangePickerValues(value ?? undefined) as RangeValue}
        {...steps}
        {...(style ? { style } : {})}
        showNow={showNow}
        allowClear={allowClear}
        {...rest}
        hideDisabledOptions={hideDisabledOptions}
        use12Hours={use12Hours}
        className={styles.shaTimepicker}
        placeholder={[placeholder, placeholder]}
      />
    );
  }

  return (
    <TimePicker
      {...(hideBorder ? { variant: 'borderless' } : {})}
      onChange={handleTimePickerChange}
      format={format}
      value={evaluatedValue}
      {...steps}
      {...(style ? { style } : {})}
      className={styles.shaTimepicker}
      placeholder={placeholder}
      showNow={showNow}
      allowClear={allowClear}
      hideDisabledOptions={hideDisabledOptions}
      use12Hours={use12Hours}
      {...rest}
    />
  );
};
