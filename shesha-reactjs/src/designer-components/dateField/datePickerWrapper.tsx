import { DatePicker } from '@/components/antd';
import moment, { isMoment, Moment } from 'moment';
import React, { FC, useMemo, useRef } from 'react';
import ReadOnlyDisplayFormItem from '@/components/readOnlyDisplayFormItem';
import { useForm, useGlobalState, useMetadata } from '@/providers';
import { getMoment, getRangeMoment } from '@/utils/date';
import { getDataProperty } from '@/utils/metadata';
import { IDateFieldProps, RangePickerChangeEvent, TimePickerChangeEvent } from './interfaces';
import { DATE_TIME_FORMATS, disabledDate, disabledTime, getFormat } from './utils';
import { asPropertiesArray } from '@/interfaces/metadata';
import { useStyles } from './style';

const MIDNIGHT_MOMENT = moment('00:00:00', 'HH:mm:ss');

const { RangePicker } = DatePicker;

export const DatePickerWrapper: FC<IDateFieldProps> = (props) => {
  const { properties: metaProperties } = useMetadata(false)?.metadata ?? {};
  const properties = asPropertiesArray(metaProperties, []);

  const { globalState } = useGlobalState();

  const {
    propertyName: name,
    hideBorder,
    range,
    value,
    showTime,
    showNow,
    onChange,
    picker = 'date',
    defaultValue,
    disabledDateMode,
    disabledDateTemplate,
    disabledDateFunc,
    disabledTimeMode,
    disabledTimeTemplate,
    disabledTimeFunc,
    readOnly,
    style,
    additionalStyles,
    defaultToMidnight,
    resolveToUTC,
    allStyles,
    enableStyleOnReadonly,
    ...rest
  } = props;

  const finalStyle = !enableStyleOnReadonly && readOnly ? {
    ...allStyles.fontStyles,
    ...allStyles.dimensionsStyles,
  } : allStyles.fullStyle;

  const dateFormat = props?.dateFormat || getDataProperty(properties, name, 'dataFormat') || DATE_TIME_FORMATS.date;
  const timeFormat = props?.timeFormat || DATE_TIME_FORMATS.time;
  const fullStyles = { ...allStyles?.fullStyle || {} };
  const { styles } = useStyles({ fullStyles });

  const { formData } = useForm();

  const pickerFormat = getFormat(props, properties);

  const convertValue = (localValue: any): string => {
    const newValue = isMoment(localValue) ? localValue : getMoment(localValue, pickerFormat);
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

  const handleDatePickerChange = (localValue: any | null, dateString: string): void => {
    if (!dateString?.trim()) {
      (onChange as TimePickerChangeEvent)(null, '');
      return;
    }
    const newValue = convertValue(localValue);

    (onChange as TimePickerChangeEvent)(newValue, dateString);
  };

  const handleRangePicker = (values: any[], formatString: [string, string]): void => {
    if (formatString?.includes('')) {
      (onChange as RangePickerChangeEvent)(null, null);
      return;
    }
    const dates = (values as []).map((val: any) => convertValue(val));

    (onChange as RangePickerChangeEvent)(dates, formatString);
  };

  const prevDatePartRef = useRef(null);


  const handleCalendarDatePickerChange = (dates: Moment | Moment[]): void => {
    if (!dates || Array.isArray(dates)) return;

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
  const defaultMomentValue = useMemo(() => getRangeMoment(defaultValue, pickerFormat), [defaultValue, pickerFormat]);


  const prevStartDatePartRef = useRef(null);
  const prevEndDatePartRef = useRef(null);

  const handleCalendarRangeChange = (dates: Moment[]): void => {
    if (!dates) return;

    const [start, end] = dates;

    const getDatePart = (date: Moment | undefined): string => date?.format('YYYY-MM-DD');

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

    const newDates = [newStart, newEnd];

    handleRangePicker(
      newDates,
      [
        newStart?.format(pickerFormat),
        newEnd?.format(pickerFormat),
      ],
    );
  };

  if (range) {
    return (
      <div style={{ marginRight: 1 }}>
        <RangePicker
          onCalendarChange={(dates) => {
            if (dates && showTime && !defaultToMidnight) handleCalendarRangeChange(dates);
          }}
          className="sha-range-picker"
          disabledDate={(e) => disabledDate(props, e, formData, globalState)}
          disabledTime={disabledTime(props, formData, globalState)}
          onChange={handleRangePicker}
          format={pickerFormat}
          value={rangeMomentValue}
          defaultValue={defaultMomentValue}
          {...rest}
          picker={picker}
          showTime={showTime ? (defaultToMidnight ? { defaultValue: [MIDNIGHT_MOMENT, MIDNIGHT_MOMENT] } : true) : false}
          disabled={readOnly}
          style={allStyles.fullStyle}
          allowClear
          variant={hideBorder ? 'borderless' : undefined}
        />
      </div>
    );
  }

  if (readOnly) {
    const format = showTime ? `${dateFormat} ${timeFormat}` : dateFormat;
    return <ReadOnlyDisplayFormItem value={momentValue} type="datetime" dateFormat={format} timeFormat={timeFormat} style={finalStyle} />;
  }

  return (
    <div style={{ marginRight: 1 }}>
      <DatePicker
        className={styles.dateField}
        disabledDate={(e) => disabledDate(props, e, formData, globalState)}
        disabledTime={disabledTime(props, formData, globalState)}
        onChange={handleDatePickerChange}
        variant={hideBorder ? 'borderless' : undefined}
        showTime={showTime ? (defaultToMidnight ? { defaultValue: MIDNIGHT_MOMENT } : true) : false}
        showNow={showNow}
        picker={picker}
        format={pickerFormat}
        style={allStyles.fullStyle}
        onCalendarChange={(dates) => {
          if (dates && showTime && !defaultToMidnight) handleCalendarDatePickerChange(dates);
        }}
        {...rest}
        value={momentValue}
        allowClear
      />
    </div>
  );
};
