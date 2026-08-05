import { DatePicker } from '@/components/antd';
import moment, { Moment } from 'moment';
import React, { forwardRef, useMemo, useRef } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useForm, useGlobalState, useMetadataOrUndefined } from '@/providers';
import { getMoment, getRangeMoment } from '@/utils/date';
import { getDataProperty } from '@/utils/metadata';
import { IDateFieldProps, NoUndefinedRangeValueType, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import { disabledDate, disabledTime, getFormat, getPicker, hasTimePart, serializeValue, supportsMinuteStep } from './utils';
import { asPropertiesArray } from '@/interfaces/metadata';
import { useStyles } from './styles';
import { DATE_TIME_FORMATS } from '@/constants/formats';
import { isDefined, isNotNullOrWhiteSpace, isNullOrWhiteSpace } from '@/utils/nullables';

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

export const DatePickerWrapper = forwardRef<HTMLDivElement, IDateFieldProps>((props, ref) => {
  const { properties: metaProperties } = useMetadataOrUndefined()?.metadata ?? {};
  const properties = asPropertiesArray(metaProperties, []);

  const { globalState } = useGlobalState();

  const {
    propertyName: name,
    placeholder,
    hideBorder,
    range,
    value,
    showNow,
    onChange,
    readOnly,
    defaultToMidnight,
    minuteStep,
  } = props;

  const picker = getPicker(props);
  const showTime = hasTimePart(props);

  const metadataFormat = !isNullOrWhiteSpace(name) ? getDataProperty(properties, name, 'dataFormat') : undefined;
  const dateFormat = isNotNullOrWhiteSpace(props.dateFormat)
    ? props.dateFormat
    : isNotNullOrWhiteSpace(metadataFormat) ? metadataFormat : DATE_TIME_FORMATS.date;
  const timeFormat = isNotNullOrWhiteSpace(props.timeFormat) ? props.timeFormat : DATE_TIME_FORMATS.time;
  const { styles } = useStyles(props);

  const { formData } = useForm();

  const pickerFormat = getFormat(props, properties);

  /* The time picker only offers a minute step where minutes are actually shown. */
  const minuteStepConfig = useMemo(() => supportsMinuteStep(props) && isDefined(minuteStep) ? { minuteStep } : {}, [props, minuteStep]);

  const showTimeConfig = useMemo(() => {
    if (!showTime) return false;
    return defaultToMidnight === true
      ? { defaultValue: MIDNIGHT_MOMENT, ...minuteStepConfig }
      : { ...minuteStepConfig };
  }, [showTime, defaultToMidnight, minuteStepConfig]);

  const rangeShowTimeConfig = useMemo(() => {
    if (!showTime) return false;
    return defaultToMidnight === true
      ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] as [Moment, Moment], ...minuteStepConfig }
      : { ...minuteStepConfig };
  }, [showTime, defaultToMidnight, minuteStepConfig]);

  const convertValue = (localValue: Moment): string => {
    const newValue = localValue;
    const val =
      picker === 'week'
        ? newValue.startOf('week')
        : picker === 'month'
          ? newValue.startOf('month')
          : picker === 'quarter'
            ? newValue.startOf('quarter')
            : picker === 'year'
              ? newValue.startOf('year')
              : !showTime
                ? newValue.startOf('day')
                : newValue;

    return serializeValue(val, props);
  };
  const convertValueOrNull = (localValue: Moment | null): string | null => localValue ? convertValue(localValue) : null;

  const handleDatePickerChange = (localValue: Moment | null | undefined, dateString: string | null): void => {
    if (!isDefined(localValue)) {
      (onChange as TimePickerChangeEvent)(null, '');
    } else {
      const newValue = convertValue(localValue);

      (onChange as TimePickerChangeEvent)(newValue, dateString);
    }
  };

  const handleRangePicker = (values: NoUndefinedRangeValueType<Moment> | null, formatString: [string, string]): void => {
    if (!values) {
      (onChange as RangePickerChangeEvent)(null, ["", ""]);
      return;
    }
    const dates: NoUndefinedRangeValueType<string> = [convertValueOrNull(values[0]), convertValueOrNull(values[1])];

    (onChange as RangePickerChangeEvent)(dates, formatString);
  };

  const prevDatePartRef = useRef<string>(null);


  const handleCalendarDatePickerChange = (dates: Moment | Moment[]): void => {
    if (Array.isArray(dates)) return;

    const getDatePart = (date: Moment): string => date.format('YYYY-MM-DD');

    const newDatePart = getDatePart(dates);
    const prevDatePart = prevDatePartRef.current;

    let newDate;

    if (newDatePart !== prevDatePart) {
      // Date part changed — override time with current system time
      const now = moment();
      newDate = dates.clone().set({
        hour: now.hour(),
        minute: now.minute(),
        second: now.second(),
      });
    } else {
      // Date part did not change — user changed the time, keep it as is
      newDate = dates;
    }

    prevDatePartRef.current = newDatePart;

    handleDatePickerChange(newDate, newDate.format(pickerFormat));
  };

  const momentValue = useMemo(() => getMoment(value, pickerFormat), [value, pickerFormat]);
  const rangeMomentValue = useMemo(() => getRangeMoment(value, pickerFormat), [value, pickerFormat]);

  const prevStartDatePartRef = useRef<string>(undefined);
  const prevEndDatePartRef = useRef<string>(undefined);

  // NoUndefinedRangeValueType<DateType>
  // const handleCalendarRangeChange = (dates: Moment[]): void => {
  const handleCalendarRangeChange = (dates: NoUndefinedRangeValueType<Moment>): void => {
    const [start, end] = dates;

    const getDatePart = (date: Moment | null): string | undefined => date?.format('YYYY-MM-DD');

    const startDatePart = getDatePart(start);
    const endDatePart = getDatePart(end);

    let newStart = start;
    let newEnd = end;

    /* start and end date parts are used to determine if the user has changed the date part of the date
    if the date part has changed, we override the time with the current system time
    if the date part has not changed, we keep the time as it is */
    if (start) {
      const prevStartDatePart = prevStartDatePartRef.current;
      if (startDatePart !== prevStartDatePart) {
        const nowForStart = moment();
        newStart = start.clone().set({
          hour: nowForStart.hour(),
          minute: nowForStart.minute(),
          second: nowForStart.second(),
        });
      }
      prevStartDatePartRef.current = startDatePart;
    }

    if (end) {
      const prevEndDatePart = prevEndDatePartRef.current;
      if (endDatePart !== prevEndDatePart) {
        const nowForEnd = moment();
        newEnd = end.clone().set({
          hour: nowForEnd.hour(),
          minute: nowForEnd.minute(),
          second: nowForEnd.second(),
        });
      }
      prevEndDatePartRef.current = endDatePart;
    }

    const newDates: NoUndefinedRangeValueType<Moment> = [newStart, newEnd];

    handleRangePicker(
      newDates,
      [
        newStart ? newStart.format(pickerFormat) : "",
        newEnd ? newEnd.format(pickerFormat) : "",
      ],
    );
  };

  if (range === true) {
    return (
      <div ref={ref} style={{ marginRight: 1 }}>
        <RangePicker
          onCalendarChange={(dates) => {
            if (showTime && defaultToMidnight !== true) handleCalendarRangeChange(dates);
          }}
          className={styles.rangePicker}
          disabledDate={(e) => disabledDate(props, e, formData, globalState)}
          disabledTime={disabledTime(props, formData, globalState)}
          onChange={(dates, datesString) => handleRangePicker(dates, datesString)}
          format={pickerFormat}
          value={rangeMomentValue}
          picker={picker}
          showTime={rangeShowTimeConfig}
          disabled={readOnly === true}
          allowClear
          {...(isDefined(props.styleJson) ? { style: props.styleJson } : {})}
          {...(hideBorder === true ? { variant: 'borderless' } : {})}
          {...(isDefined(props.onFocus) ? { onFocus: props.onFocus } : {})}
          {...(isDefined(props.onBlur) ? { onBlur: props.onBlur } : {})}
          {...(isNotNullOrWhiteSpace(placeholder) ? { placeholder: [placeholder, placeholder] } : {})}
        />
      </div>
    );
  }

  if (readOnly === true) {
    const format = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;
    return (
      <ReadOnlyDisplayFormItem
        value={momentValue}
        type="datetime"
        dateFormat={format}
        timeFormat={timeFormat}
        enableFullStyle={props.enableStyleOnReadonly}
        style={props.styleJson}
        styleValue={props}
      />
    );
  }

  return (
    <div ref={ref} style={{ marginRight: 1 }}>
      <DatePicker
        className={styles.dateField}
        disabledDate={(e) => disabledDate(props, e, formData, globalState)}
        disabledTime={disabledTime(props, formData, globalState)}
        onChange={handleDatePickerChange}
        {...(hideBorder === true ? { variant: 'borderless' } : {})}
        showTime={showTimeConfig}
        showNow={showNow === true}
        picker={picker}
        format={pickerFormat}
        onCalendarChange={(dates) => {
          if (showTime && defaultToMidnight !== true) handleCalendarDatePickerChange(dates);
        }}
        value={momentValue}
        {...(isNotNullOrWhiteSpace(placeholder) ? { placeholder } : {})}
        allowClear
        {...(isDefined(props.styleJson) ? { style: props.styleJson } : {})}
        {...(isDefined(props.onFocus) ? { onFocus: props.onFocus } : {})}
        {...(isDefined(props.onBlur) ? { onBlur: props.onBlur } : {})}
      />
    </div>
  );
});

DatePickerWrapper.displayName = 'DatePickerWrapper';
