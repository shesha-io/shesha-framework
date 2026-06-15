import { DatePicker } from '@/components/antd';
import moment, { Moment } from 'moment';
import React, { CSSProperties, useMemo, useRef } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { FCUnwrapped, useForm, useGlobalState, useMetadataOrUndefined } from '@/providers';
import { getMoment, getRangeMoment } from '@/utils/date';
import { getDataProperty } from '@/utils/metadata';
import { IDateFieldProps, NoUndefinedRangeValueType, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import { disabledDate, disabledTime, getFormat } from './utils';
import { asPropertiesArray } from '@/interfaces/metadata';
import { useStyles } from './style';
import { DATE_TIME_FORMATS } from '@/constants/formats';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

export const DatePickerWrapper: FCUnwrapped<IDateFieldProps> = (props) => {
  const { properties: metaProperties } = useMetadataOrUndefined()?.metadata ?? {};
  const properties = asPropertiesArray(metaProperties, []);

  const { globalState } = useGlobalState();

  const {
    propertyName: name,
    placeholder,
    hideBorder,
    range,
    value,
    showTime,
    showNow,
    onChange,
    picker = 'date',
    readOnly,
    additionalStyles = {},
    defaultToMidnight,
    resolveToUTC,
  } = props;


  const dateFormat = props.dateFormat || (!isNullOrWhiteSpace(name) ? getDataProperty(properties, name, 'dataFormat') : undefined) || DATE_TIME_FORMATS.date;
  const timeFormat = props.timeFormat || DATE_TIME_FORMATS.time;
  const { styles } = useStyles({ fullStyles: additionalStyles });
  const finalStyles: CSSProperties = { ...additionalStyles };

  const { formData } = useForm();

  const pickerFormat = getFormat(props, properties);

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

    const finalMoment = resolveToUTC ? val.clone().utc() : val.clone().local();
    return resolveToUTC ? finalMoment.toISOString() : finalMoment.format('YYYY-MM-DDTHH:mm:ss.SSS');
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

  if (range) {
    return (
      <div style={{ marginRight: 1 }}>
        <RangePicker
          onCalendarChange={(dates) => {
            if (showTime && !defaultToMidnight) handleCalendarRangeChange(dates);
          }}
          className="sha-range-picker"
          disabledDate={(e) => disabledDate(props, e, formData, globalState)}
          disabledTime={disabledTime(props, formData, globalState)}
          onChange={(dates, datesString) => handleRangePicker(dates, datesString)}
          format={pickerFormat}
          value={rangeMomentValue}
          picker={picker}
          showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
          disabled={readOnly === true}
          style={finalStyles}
          allowClear
          {...(hideBorder ? { variant: 'borderless' } : {})}
          {...(props.onFocus ? { onFocus: props.onFocus } : {})}
          {...(props.onBlur ? { onBlur: props.onBlur } : {})}
          {...(!isNullOrWhiteSpace(placeholder) ? { placeholder: [placeholder, placeholder] } : {})}
        />
      </div>
    );
  }

  if (readOnly) {
    const format = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;
    return <ReadOnlyDisplayFormItem value={momentValue} type="datetime" dateFormat={format} timeFormat={timeFormat} style={finalStyles} />;
  }

  return (
    <div style={{ marginRight: 1 }}>
      <DatePicker
        className={styles.dateField}
        disabledDate={(e) => disabledDate(props, e, formData, globalState)}
        disabledTime={disabledTime(props, formData, globalState)}
        onChange={handleDatePickerChange}
        {...(hideBorder ? { variant: 'borderless' } : {})}
        showTime={showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false}
        {...(showNow ? { showNow } : {})}
        picker={picker}
        format={pickerFormat}
        style={{ ...finalStyles }}
        onCalendarChange={(dates) => {
          if (showTime && !defaultToMidnight) handleCalendarDatePickerChange(dates);
        }}
        value={momentValue}
        {...(!isNullOrWhiteSpace(placeholder) ? { placeholder } : {})}
        allowClear
        {...(props.onFocus ? { onFocus: props.onFocus } : {})}
        {...(props.onBlur ? { onBlur: props.onBlur } : {})}
      />
    </div>
  );
};
